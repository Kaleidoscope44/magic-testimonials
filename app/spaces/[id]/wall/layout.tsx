import { Metadata } from 'next'
import { createClient } from '@/utils/supabase'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // On récupère le nom de l'espace pour le mettre dans le titre du lien
  const supabase = createClient()
  const { data: space } = await supabase
    .from('spaces')
    .select('name')
    .eq('id', params.id)
    .single()

  const title = `Mur d'Amour - ${space?.name || 'Témoignages'}`
  const description = `Découvrez les avis clients authentifiés de ${space?.name}. Propulsé par TestiWall.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      // Tu pourras ajouter une image de preview plus tard
      images: ['https://ton-saas.com/og-image.png'], 
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default function WallLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
