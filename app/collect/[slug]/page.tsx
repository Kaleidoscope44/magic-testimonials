'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Send, CheckCircle2, Loader2, Sparkles, Quote } from 'lucide-react'

export default function CollectPage() {
  const { slug } = useParams()
  const supabase = createClient()

  const [space, setSpace] = useState<any>(null)
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', content: '', rating: 5 })
  const [loading, setLoading] = useState(true)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const initPage = async () => {
      // 1. Récupérer l'espace
      const { data: spaceData } = await supabase
        .from('spaces')
        .select('*')
        .eq('slug', slug)
        .single()

      if (spaceData) {
        setSpace(spaceData)
        
        // 2. Récupérer l'email de l'owner via une fonction RPC ou une table profil
        // Si tu n'as pas de table 'profiles', on peut utiliser une astuce : 
        // les emails sont protégés dans auth.users, mais pour ce SaaS, 
        // on va supposer que tu as l'email ou on le récupère via une petite requête.
        // NOTE: Pour que ça marche, l'owner_id doit être lié à ton utilisateur.
        
        // Incrémenter les vues
        await supabase
          .from('spaces')
          .update({ views: (spaceData.views || 0) + 1 })
          .eq('id', spaceData.id)

        // Récupérer l'email du propriétaire (Owner)
        // Note: Dans Supabase, pour accéder à l'email d'un autre user, il faut souvent une table 'profiles' publique.
        // Si tu n'en as pas, on utilise l'ID pour l'instant ou on passe par l'API.
      }
      setLoading(false)
    }
    initPage()
  }, [slug, supabase])

  const submitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    // 1. Insertion de l'avis
    const { error } = await supabase.from('testimonials').insert([
      { 
        space_id: space.id, 
        client_name: form.name, 
        content: form.content, 
        rating: form.rating 
      }
    ])

    if (!error) {
      setSent(true)

      // 2. Notification par Email
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: form.name,
            rating: form.rating,
            content: form.content,
            spaceName: space.name,
            ownerId: space.owner_id // On envoie l'ID, l'API se chargera de trouver l'email
          })
        })
      } catch (err) {
        console.error("Erreur notification:", err)
      }
    } else {
      alert("Erreur : " + error.message)
    }
    setSending(false)
  }

  // ... (Le reste de ton rendu JSX reste exactement le même)

  if (loading) return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  )
  

  if (!space) return (
    <div className="min-h-screen bg-[#09090f] text-white flex items-center justify-center text-center p-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Oups ! 😶</h1>
        <p className="text-slate-500">Cet espace n'existe pas ou a été supprimé.</p>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#09090f] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Orbs pour l'ambiance */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-xl relative z-10">
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-[40px] backdrop-blur-xl shadow-2xl"
            >
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/20">
                  <Quote className="text-white w-8 h-8 fill-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black mb-2 italic">"{space.name}"</h1>
                <p className="text-slate-400 text-sm font-medium tracking-wide">Laissez-nous un message !</p>
              </div>

              <form onSubmit={submitTestimonial} className="space-y-6">
                {/* Sélecteur d'étoiles stylé */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Votre note</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star} type="button" 
                        onClick={() => setForm({...form, rating: star})}
                        className="transition-transform active:scale-75"
                      >
                        <Star className={`w-9 h-9 ${star <= form.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700 hover:text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <input 
                    type="text" placeholder="Votre nom" required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-violet-500 transition text-sm"
                    onChange={e => setForm({...form, name: e.target.value})}
                  />
                  <textarea 
                    placeholder="Qu'avez-vous pensé de nous ?" required rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-violet-500 transition resize-none text-sm"
                    onChange={e => setForm({...form, content: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" disabled={sending}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Publier mon avis</>}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 border border-emerald-500/20 p-12 rounded-[40px] text-center backdrop-blur-xl"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-emerald-400 w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4 italic">Merci {form.name.split(' ')[0]} !</h2>
              <p className="text-slate-400 leading-relaxed">
                Votre expérience a été enregistrée avec succès. <br/>
                Vous aidez <span className="text-white font-bold">{space.name}</span> à grandir !
              </p>
            </motion.div>

            )}
        </AnimatePresence>

        <p className="mt-12 text-center text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-violet-500" />
          Powered by TestiWall
        </p>
      </div>
    </main>
  )
}