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
    const isTrustpilot = url.includes("trustpilot");
    
    let actorId = "";
    let requestBody: any = {};

    if (isTrustpilot) {
      // Acteur officiel Apify pour Trustpilot
      actorId = "apify~trustpilot-scraper";
      requestBody = {
        "startUrls": [{ "url": url }],
        "maxReviews": 10,
        "proxyConfiguration": { "useApifyProxy": true } // Essentiel pour Trustpilot
      };
    } else if (isTripAdvisor) {
      actorId = "maxcopell~tripadvisor-reviews";
      requestBody = {
        "startUrls": [{ "url": url }],
        "maxReviews": 10,
        "proxyConfiguration": { "useApifyProxy": true }
      };
    } else {
      // Acteur Google Maps
      actorId = "compass~google-maps-reviews-scraper";
      requestBody = {
        "startUrls": [{ "url": url }],
        "maxReviews": 10,
        "reviewsSort": "newest"
      };
    }

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
        if (isTrustpilot) {
          // Mapping spécifique Trustpilot
          return {
            client_name: review.consumer?.displayName || "Client Trustpilot",
            // Trustpilot sépare souvent Title et Text
            content: review.text ? (review.title ? `${review.title} : ${review.text}` : review.text) : review.title,
            rating: Math.round(review.rating || 5),
            platform: "trustpilot",
            source_url: url,
            space_id: spaceId,
            external_id: review.id || Buffer.from(`${review.consumer?.displayName}-${review.createdAt}`).toString('base64')
          }
        } else if (isTripAdvisor) {
          return {
            client_name: review.user?.name || review.user?.username || "Client TripAdvisor",
            content: review.title ? `${review.title} : ${review.text}` : review.text,
            rating: Math.round(review.rating > 10 ? review.rating / 10 : review.rating || 5),
            platform: "tripadvisor",
            source_url: url,
            space_id: spaceId,
            external_id: review.id || Buffer.from(`${review.user?.name}-${review.publishedDate}`).toString('base64')
          }
        } else {
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
