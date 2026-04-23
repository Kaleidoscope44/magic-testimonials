import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js' // Import direct du SDK

export async function POST(req: Request) {
  try {
    const { url, spaceId } = await req.json()
    const API_TOKEN = process.env.APIFY_API_TOKEN
    
    // Initialisation du client Admin (ignore la RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // TA CLÉ SECRÈTE ICI
    )

    if (!API_TOKEN) {
      return NextResponse.json({ error: "Clé API manquante" }, { status: 500 })
    }

    const isTripAdvisor = url.includes("tripadvisor");
    const isTrustpilot = url.includes("trustpilot");
    
    let actorId = "";
    let requestBody: any = {};

    if (isTrustpilot) {
      actorId = "apify~playwright-scraper";
      requestBody = {
        "startUrls": [{ "url": url }],
        "maxPagesPerRun": 1,
        "runMode": "PRODUCTION",
        "pageFunction": `async function pageFunction(context) {
            const { page } = context;
            await page.waitForSelector('article', { timeout: 15000 });
            return await page.$$eval('article', (articles) => {
                return articles.map(el => {
                    const name = el.querySelector('[data-consumer-name-typography]')?.innerText;
                    const title = el.querySelector('[data-review-title-typography]')?.innerText;
                    const body = el.querySelector('[data-review-content-typography]')?.innerText;
                    const ratingImg = el.querySelector('div[data-review-rating] img');
                    const rating = ratingImg ? ratingImg.getAttribute('alt').match(/\\d+/)[0] : "5";
                    return {
                        id: el.getAttribute('data-review-id') || Math.random().toString(),
                        "user.name": name?.trim() || "Client Trustpilot",
                        title: title?.trim() || "",
                        body: body?.trim() || "",
                        rating: rating
                    };
                });
            });
        }`
      };
    } else if (isTripAdvisor) {
      actorId = "maxcopell~tripadvisor-reviews";
      requestBody = {
        "startUrls": [{ "url": url }],
        "maxReviews": 10,
        "proxyConfiguration": { "useApifyProxy": true }
      };
    } else {
      actorId = "compass~google-maps-reviews-scraper";
      requestBody = {
        "startUrls": [{ "url": url }],
        "maxReviews": 10,
        "reviewsSort": "newest"
      };
    }

    // 1. LANCEMENT DU RUN APIFY
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

      // 2. MAPPING DYNAMIQUE
      const reviews = items.map((review: any, index: number) => {
        if (isTrustpilot) {
          return {
            client_name: review["user.name"],
            content: review.body ? (review.title ? `${review.title} : ${review.body}` : review.body) : review.title,
            rating: Math.round(parseInt(review.rating) || 5),
            platform: "trustpilot",
            source_url: url,
            space_id: spaceId,
            external_id: review.id || `tp-${index}`
          }
        } else if (isTripAdvisor) {
          return {
            client_name: review.user?.name || review.user?.username || "Client TripAdvisor",
            content: review.title ? `${review.title} : ${review.text}` : review.text,
            rating: Math.round(review.rating > 10 ? review.rating / 10 : review.rating || 5),
            platform: "tripadvisor",
            source_url: url,
            space_id: spaceId,
            external_id: review.id || `ta-${index}`
          }
        } else {
          return {
            client_name: review.name || review.authorName || "Client Anonyme",
            content: review.text || "Avis sans texte",
            rating: Math.round(review.stars || review.rating || 5),
            platform: "google",
            source_url: url,
            space_id: spaceId,
            external_id: review.reviewId || `go-${index}`
          }
        }
      })

      // 3. INSERTION DIRECTE DANS SUPABASE (Côté Serveur)
      const { data, error: dbError } = await supabaseAdmin
        .from('testimonials')
        .upsert(reviews, { 
            onConflict: 'external_id',
            ignoreDuplicates: true 
        })

      if (dbError) throw dbError

      return NextResponse.json({ success: true, count: reviews.length })
    }

    return NextResponse.json({ error: "Échec d'Apify" }, { status: 500 })

  } catch (error: any) {
    console.error("ERREUR:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}