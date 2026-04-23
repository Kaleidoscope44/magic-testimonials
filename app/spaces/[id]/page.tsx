'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  ArrowLeft, Star, Trash2, ExternalLink, 
  MessageSquare, Calendar, User, 
  Copy, Check, Loader2, Sparkles, Layout,
  Link as LinkIcon, Plus
} from 'lucide-react'
import { SiGoogle, SiTrustpilot } from 'react-icons/si'

// Petit composant SVG pour TripAdvisor
const TripAdvisorIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm6.608 11.234a2.385 2.385 0 0 1-2.385 2.385 2.385 2.385 0 0 1-2.385-2.385 2.385 2.385 0 0 1 2.385-2.385 2.385 2.385 0 0 1 2.385 2.385zm-9.216 0A2.385 2.385 0 0 1 7.007 15.62a2.385 2.385 0 0 1-2.385-2.385 2.385 2.385 0 0 1 2.385-2.385 2.385 2.385 0 0 1 2.385 2.385zM12 17.5a4.5 4.5 0 0 1-4.182-2.835 5.485 5.485 0 0 0 8.364 0A4.5 4.5 0 0 1 12 17.5z"/>
  </svg>
)

export default function SpaceDetails() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [spaceName, setSpaceName] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  
  const [url, setUrl] = useState("")
  const [importing, setImporting] = useState(false)

  const fetchData = async () => {
    const { data: space } = await supabase.from('spaces').select('name').eq('id', id).single()
    if (space) setSpaceName(space.name)

    const { data: reviews } = await supabase
      .from('testimonials')
      .select('*')
      .eq('space_id', id)
      .order('created_at', { ascending: false })
    
    if (reviews) setTestimonials(reviews)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

const handleImport = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!url) return;

  setImporting(true);
  const toastId = toast.loading("Le robot explore les sites d'avis...");

  try {
    const response = await fetch('/api/import-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url, spaceId: id })
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Erreur lors de l'import");

    // Si on arrive ici, l'API a déjà inséré les données dans Supabase
    toast.success(`Synchronisation réussie !`, { id: toastId });
    // toast.success(`${result.length} avis synchronisés !`, { id: toastId });

    setUrl("");
    
    // On rafraîchit simplement les données affichées à l'écran
    fetchData(); 

  } catch (err: any) {
    console.error("Erreur import:", err);
    toast.error("Échec de l'importation", { 
      id: toastId, 
      description: err.message 
    });
  } finally {
    setImporting(false);
  }
};

  const deleteTestimonial = (tId: string) => {
    toast("Supprimer ce témoignage ?", {
      description: "Cette action est irréversible.",
      action: {
        label: "Supprimer",
        onClick: () => executeDelete(tId),
      },
    });
  };

  const executeDelete = async (tId: string) => {
    const promise = supabase.from('testimonials').delete().eq('id', tId);
    toast.promise(promise as any, {
      loading: 'Suppression...',
      success: () => { fetchData(); return 'Supprimé.'; },
      error: 'Erreur.',
    });
  };

  const copyEmbedCode = () => {
    const code = `<iframe src="${window.location.origin}/spaces/${id}/wall" width="100%" height="600px" frameborder="0" style="border-radius:12px;"></iframe>`
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.info("Code d'intégration copié !");
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  )

  return (
    <main className="min-h-screen bg-[#09090f] text-white p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white transition text-sm mb-4 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retour au dashboard
            </button>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Gestion : <span className="text-violet-400">{spaceName}</span>
            </h1>
          </div>

          <a href={`/spaces/${id}/wall`} target="_blank" className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2.5 rounded-xl font-bold transition text-sm">
            <Layout className="w-4 h-4" />
            Voir le Wall
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* --- BLOC IMPORT --- */}
            <div className="p-1 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-[32px]">
              <div className="bg-[#0c0c14] p-6 rounded-[31px]">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  Importation Multi-Source
                </h2>
                <form onSubmit={handleImport} className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="url" required value={url} 
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Lien Google Maps ou TripAdvisor..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition"
                    />
                  </div>
                  <button type="submit" disabled={importing} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition min-w-[140px]">
                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {importing ? 'Import...' : 'Importer'}
                  </button>
                </form>
              </div>
            </div>

            {/* --- LISTE --- */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Témoignages ({testimonials.length})
              </h2>

              <AnimatePresence mode="popLayout">
                {testimonials.map((t) => (
                  <motion.div 
                    key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="p-6 bg-white/5 border border-white/10 rounded-[24px] group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 font-bold text-violet-400 text-xs uppercase">
                          {t.client_name ? t.client_name[0] : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-100">{t.client_name}</h3>
                            {/* BADGE DE PLATEFORME DYNAMIQUE */}
                            <span className={`text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-black tracking-widest border ${
                              t.platform === 'tripadvisor' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : t.platform === 'trustpilot'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' // Couleur Trustpilot
                                : 'bg-red-500/10 text-red-400 border-red-500/20'    // Couleur Google
                            }`}>
                              {t.platform === 'tripadvisor' && <TripAdvisorIcon className="w-2.5 h-2.5" />}
                              {t.platform === 'trustpilot' && <SiTrustpilot className="w-2.5 h-2.5" />}
                              {t.platform === 'google' && <SiGoogle className="w-2.5 h-2.5" />}
                              {!t.platform && <SiGoogle className="w-2.5 h-2.5" />} 
                              
                              {t.platform || 'Google'}
                            </span>
                          </div>
                          <div className="flex gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < t.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteTestimonial(t.id)} className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-slate-400 text-sm italic">"{t.content}"</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* COLONNE DROITE */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-6 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-[32px]">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Intégration
              </h2>
              <p className="text-slate-400 text-xs mb-6">Copiez ce code pour afficher le mur sur votre site.</p>
              <div className="bg-[#050508] border border-white/10 rounded-2xl p-4 font-mono text-[10px] text-violet-300 break-all overflow-hidden">
                <pre className="whitespace-pre-wrap">
                  {`<iframe \n  src="${typeof window !== 'undefined' ? window.location.origin : ''}/spaces/${id}/wall" \n  width="100%" \n  height="600px" \n  frameborder="0"\n  style="border-radius:12px;"\n></iframe>`}
                </pre>
              </div>
              <button 
                onClick={copyEmbedCode}
                className={`w-full mt-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  copied ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-slate-200'
                }`}
              >
                {copied ? <><Check className="w-4 h-4" /> Copié !</> : <><Copy className="w-4 h-4" /> Copier le code</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

