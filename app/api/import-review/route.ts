import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { url, spaceId } = await req.json()
    const API_TOKEN = process.env.APIFY_API_TOKEN

    if (!API_TOKEN) {
      return NextResponse.json({ error: "Clé API manquante dans le fichier .env" }, { status: 500 })
    }

    // Acteur Compass (fiable pour les comptes gratuits)
    const actorId = "compass~google-maps-reviews-scraper"

    // On lance le run en mode synchrone (waitForFinish)
    const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${API_TOKEN}&waitForFinish=120`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "startUrls": [{ "url": url }],
        "maxReviews": 20, // Tu peux monter jusqu'à 50 ou 100 selon tes crédits Apify
        "reviewsSort": "newest"
      })
    })

    const runData = await response.json()

    // Vérification si le run a généré un dataset
    if (runData.data && runData.data.defaultDatasetId) {
      const datasetId = runData.data.defaultDatasetId
      
      // On récupère tous les items du dataset
      const itemsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${API_TOKEN}`)
      const items = await itemsResponse.json()
      
      if (!items || items.length === 0) {
        return NextResponse.json({ error: "Aucun avis trouvé par le robot" }, { status: 404 })
      }

      // Transformation de TOUS les avis reçus
      const reviews = items.map((review: any) => ({
        client_name: review.name || review.authorName || "Client Anonyme",
        content: review.text || "Avis sans texte",
        rating: Math.round(review.stars || review.rating || 5),
        platform: "google",
        source_url: url,
        space_id: spaceId,
        // Création d'un identifiant pour aider Supabase à repérer les doublons
        external_id: review.reviewId || Buffer.from(`${review.name}-${review.text?.substring(0, 15)}`).toString('base64')
      }))

      return NextResponse.json(reviews)
    }

    return NextResponse.json({ error: "Apify n'a pas pu traiter la demande" }, { status: 500 })

  } catch (error: any) {
    console.error("ERREUR SERVEUR:", error.message)
    return NextResponse.json({ error: "Erreur interne au serveur" }, { status: 500 })
  }
}