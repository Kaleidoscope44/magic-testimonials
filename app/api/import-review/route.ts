import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { url, spaceId } = await req.json()
    const API_TOKEN = process.env.APIFY_API_TOKEN

    if (!API_TOKEN) {
      return NextResponse.json({ error: "Clé API manquante dans le fichier .env" }, { status: 500 })
    }

    // --- 1. DÉTECTION DE LA PLATEFORME ---
    const isTripAdvisor = url.includes("tripadvisor");
    
    // On choisit l'acteur et le corps de la requête selon l'URL
    const actorId = isTripAdvisor 
      ? "maxcopell/tripadvisor-reviews" // Acteur TripAdvisor
      : "compass~google-maps-reviews-scraper";  // Acteur Google

    const requestBody = isTripAdvisor 
      ? {
          "startUrls": [{"url": url}], // TripAdvisor scraper utilise souvent "urls"
          "maxReviews": 3,
          "reviewsSort": "newest"
        }
      : {
          "startUrls": [{ "url": url }], // Google scraper utilise "startUrls"
          "maxReviews": 20,
          "reviewsSort": "newest"
        };

    // --- 2. LANCEMENT DU RUN ---
    const response = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${API_TOKEN}&waitForFinish=120`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    const runData = await response.json()

    if (runData.data && runData.data.defaultDatasetId) {
      const datasetId = runData.data.defaultDatasetId
      const itemsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${API_TOKEN}`)
      const items = await itemsResponse.json()
      
      if (!items || items.length === 0) {
        return NextResponse.json({ error: "Aucun avis trouvé par le robot" }, { status: 404 })
      }

      // --- 3. TRANSFORMATION (MAPPING) DYNAMIQUE ---
      const reviews = items.map((review: any) => {
        if (isTripAdvisor) {
          // Mapping spécifique TripAdvisor
          return {
            client_name: review.user?.name || review.user?.username || "Client TripAdvisor",
            // On combine le titre et le texte pour un rendu "stylé"
            content: review.title ? `${review.title} : ${review.text}` : review.text,
            // TripAdvisor met souvent des notes comme 50, 40, etc. On divise par 10 si besoin.
            rating: Math.round(review.rating > 10 ? review.rating / 10 : review.rating || 5),
            platform: "tripadvisor",
            source_url: url,
            space_id: spaceId,
            external_id: review.id || Buffer.from(`${review.user?.name}-${review.publishedDate}`).toString('base64')
          }
        } else {
          // Ton mapping Google actuel (inchangé)
          return {
            client_name: review.name || review.authorName || "Client Anonyme",
            content: review.text || "Avis sans texte",
            rating: Math.round(review.stars || review.rating || 5),
            platform: "google",
            source_url: url,
            space_id: spaceId,
            external_id: review.reviewId || Buffer.from(`${review.name}-${review.text?.substring(0, 15)}`).toString('base64')
          }
        }
      })

      return NextResponse.json(reviews)
    }

    return NextResponse.json({ error: "Apify n'a pas pu traiter la demande" }, { status: 500 })

  } catch (error: any) {
    console.error("ERREUR SERVEUR:", error.message)
    return NextResponse.json({ error: "Erreur interne au serveur" }, { status: 500 })
  }
}

