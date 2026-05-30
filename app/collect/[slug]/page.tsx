'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Star, Loader2, Mail, User, MessageSquare, Sparkles, CheckCircle } from 'lucide-react'

function CornerBorders() {
  return (
    <>
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-violet-500/30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-violet-500/30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-violet-500/30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-violet-500/30 pointer-events-none" />
    </>
  );
}

export default function LeaveReviewForm() {
  // On récupère 'slug' ou 'id' de manière dynamique selon le nom de ton dossier Next.js
  const params = useParams()
  const currentParam = params.slug || params.id
  
  const supabase = createClient()

  const [realSpaceId, setRealSpaceId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  
  const [loadingSpace, setLoadingSpace] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // ÉTAPE 1 : Trouver le vrai UUID de l'espace au chargement de la page
  useEffect(() => {
    const getSpaceUUID = async () => {
      if (!currentParam) return

      // Si le paramètre est déjà un UUID, on l'utilise directement
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentParam as string)
      if (isUUID) {
        setRealSpaceId(currentParam as string)
        setLoadingSpace(false)
        return
      }

      // Sinon, on va chercher l'UUID de l'espace qui correspond à ce slug (ex: 'boulagerie')
      // Note : Adapte 'slug' ci-dessous si ta colonne s'appelle autrement dans ta table 'spaces' (ex: 'name_url')
      const { data: space, error } = await supabase
        .from('spaces')
        .select('id')
        .eq('slug', currentParam) 
        .maybeSingle()

      if (error) {
        console.error("Erreur récupération Espace:", error)
      } else if (space) {
        setRealSpaceId(space.id)
      }
      setLoadingSpace(false)
    }

    getSpaceUUID()
  }, [currentParam, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!realSpaceId) {
      return toast.error("Impossible de lier l'avis : Espace introuvable.")
    }
    if (!name || !email || !content) {
      return toast.error("Veuillez remplir tous les champs requis.")
    }

    setSubmitting(true)
    const toastId = toast.loading("Vérification et envoi de votre témoignage...")

    try {
      // ÉTAPE 2 : Vérification de l'adresse email sur le VRAI UUID
      const { data: existingReview, error: checkError } = await supabase
        .from('testimonials')
        .select('id')
        .eq('space_id', realSpaceId)
        .eq('client_email', email.trim().toLowerCase())
        .maybeSingle()

      if (checkError) throw checkError

      if (existingReview) {
        setSubmitting(false)
        return toast.error("Opération impossible", {
          id: toastId,
          description: "Un avis a déjà été transmis avec cette adresse email pour cet espace."
        })
      }

      // ÉTAPE 3 : Insertion avec le VRAI UUID
      const { error: insertError } = await supabase
        .from('testimonials')
        .insert([{
          space_id: realSpaceId,
          client_name: name,
          client_email: email.trim().toLowerCase(),
          rating: rating,
          content: content,
          platform: 'direct',
          created_at: new Date().toISOString()
        }])

      if (insertError) throw insertError

      toast.success("Merci ! Votre avis a été enregistré.", { id: toastId })
      setSuccess(true)

    } catch (err: any) {
      console.error("Erreur complète Supabase :", err)
      toast.error("Erreur lors de l'envoi", {
        id: toastId,
        description: err?.message || "Une erreur technique est survenue."
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingSpace) {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
      </div>
    )
  }

  if (!realSpaceId) {
    return (
      <main className="min-h-screen bg-[#09090f] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full p-6 bg-white/[0.01] border border-red-500/20 rounded-sm text-center">
          <p className="text-xs text-red-400">Cet espace de collecte n'existe pas ou a été supprimé.</p>
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#09090f] text-white flex items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full p-8 bg-white/[0.01] border border-white/10 rounded-sm relative text-center shadow-xl">
          <CornerBorders />
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-sm mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-black tracking-tight mb-2">Témoignage envoyé !</h1>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            Votre précieux retour a été transmis avec succès à l'équipe. Merci pour votre temps et votre authenticité.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#09090f] text-white flex items-center justify-center p-6 antialiased">
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "45px 45px" }} />
      
      <div className="max-w-md w-full p-6 bg-white/[0.01] border border-white/10 rounded-sm relative shadow-2xl shadow-black/50">
        <CornerBorders />
        
        <div className="mb-6 text-center">
          <h1 className="text-lg font-black tracking-tight flex items-center justify-center gap-2 uppercase text-slate-100">
            <Sparkles className="w-4 h-4 text-violet-400" />
            Laisser un avis
          </h1>
          <p className="text-slate-400 text-xs mt-1">Votre retour nous aide à nous améliorer chaque jour.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Note par étoiles */}
          <div className="space-y-1.5 text-center bg-white/[0.02] border border-white/5 p-3 rounded-sm">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Votre note</label>
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => {
                const starValue = i + 1
                return (
                  <button
                    key={i} type="button"
                    onClick={() => setRating(starValue)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star className={`w-6 h-6 ${starValue <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-800'}`} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nom complet */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Nom complet</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text" required value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Alexandre Martin"
                className="w-full bg-black/40 border border-white/10 rounded-sm pl-11 pr-4 py-3 text-xs focus:border-violet-500 focus:outline-none transition-all text-slate-200"
              />
            </div>
          </div>

          {/* Adresse Email */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Adresse email</label>
              <span className="text-[9px] text-slate-500">Sécurité anti-doublon</span>
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: alex@entreprise.com"
                className="w-full bg-black/40 border border-white/10 rounded-sm pl-11 pr-4 py-3 text-xs focus:border-violet-500 focus:outline-none transition-all text-slate-200"
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Votre témoignage</label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <textarea
                required rows={4} value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Racontez votre expérience en quelques lignes..."
                className="w-full bg-black/40 border border-white/10 rounded-sm pl-11 pr-4 py-3 text-xs focus:border-violet-500 focus:outline-none transition-all text-slate-200 resize-none"
              />
            </div>
          </div>

          {/* Bouton */}
          <button
            type="submit" disabled={submitting}
            className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white py-3.5 rounded-sm text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-600/10"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {submitting ? 'Validation...' : 'Transmettre mon avis'}
          </button>
          
        </form>
      </div>
    </main>
  )
}