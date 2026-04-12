'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote, Loader2, Heart, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react'
import { SiGoogle, SiFacebook, SiX } from 'react-icons/si'
import { FaLinkedin } from 'react-icons/fa'

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
  if (diffInDays === 0) return "Aujourd'hui";
  if (diffInDays === 1) return "Hier";
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const PLATFORMS: Record<string, { icon: React.ReactNode, label: string, color: string, bgColor: string }> = {
  google: { 
    icon: <SiGoogle className="w-3 h-3 text-[#EA4335]" />, 
    label: 'Google', 
    color: 'text-[#EA4335]',
    bgColor: 'bg-[#EA4335]/10'
  },
  facebook: { 
    icon: <SiFacebook className="w-3 h-3 text-[#1877F2]" />, 
    label: 'Facebook', 
    color: 'text-[#1877F2]',
    bgColor: 'bg-[#1877F2]/10'
  },
  twitter: { 
    icon: <SiX className="w-3 h-3 text-black" />, 
    label: 'X', 
    color: 'text-black',
    bgColor: 'bg-black/10'
  },
  linkedin: { 
    icon: <FaLinkedin className="w-3 h-3 text-[#0A66C2]" />, 
    label: 'LinkedIn', 
    color: 'text-[#0A66C2]',
    bgColor: 'bg-[#0A66C2]/10'
  },
  direct: { 
    icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />, 
    label: 'Vérifié', 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10'
  }
}

export default function WallOfLove() {
  const { id } = useParams()
  const supabase = createClient()
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAvis = async () => {
      // On retire tout filtre complexe pour être sûr que ça s'affiche
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('space_id', id)
        .order('created_at', { ascending: false })
      
      if (error) console.error("Erreur Supabase:", error.message)
      if (data) setTestimonials(data)
      setLoading(false)
    }
    fetchAvis()
  }, [id, supabase])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcfd]">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fdfcfd] p-6 md:p-10">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Ce que nos clients disent de nous</h1>
        <p className="text-slate-500 font-medium italic">Témoignages authentiques et vérifiés</p>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {testimonials.map((t, index) => {
              // Sécurité : si t.platform est vide ou inconnu, on prend 'direct'
              const platformKey = (t.platform && PLATFORMS[t.platform]) ? t.platform : 'direct';
              const platformInfo = PLATFORMS[platformKey];

              return (
                <motion.div
                  key={t.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="break-inside-avoid bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-12px_rgba(124,58,237,0.1)] transition-all duration-300 relative overflow-hidden group"
                >
                  <Quote className="absolute top-6 right-8 w-10 h-10 text-slate-50 opacity-[0.1] group-hover:text-violet-500 group-hover:opacity-10 transition-all" />

                  <div className="flex justify-between items-center mb-5">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${platformInfo.bgColor}`}>
                      {platformInfo.icon}
                      <span className={`text-[10px] font-black uppercase tracking-wider ${platformInfo.color}`}>
                        {platformInfo.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDate(t.created_at)}</span>
                  </div>

                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                    ))}
                  </div>

                  <p className="text-slate-700 leading-relaxed mb-8 text-[15px] font-medium italic">"{t.content}"</p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-violet-200">
                        {t.client_name ? t.client_name[0].toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{t.client_name || "Anonyme"}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Client</p>
                      </div>
                    </div>

                    <a href={t.source_url || `/verify/${t.id}`} target="_blank" rel="noopener noreferrer"
                       className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:bg-violet-50 hover:text-violet-600 transition-all border border-transparent hover:border-violet-100">
                      {t.source_url ? <><ExternalLink className="w-3 h-3" /> Voir sur {platformInfo.label}</> : <><ShieldCheck className="w-3 h-3" /> Vérifier l'authenticité</>}
                    </a>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="mt-20 text-center">
        <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-2">
          <ShieldCheck className="w-3 h-3" />
          Secured by TestiWall Protocol
        </p>
      </div>
    </div>
  )
}