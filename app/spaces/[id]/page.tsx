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
  Link as LinkIcon, Plus, HelpCircle
} from 'lucide-react'
import { SiGoogle, SiTrustpilot } from 'react-icons/si'

// Petit composant SVG pour TripAdvisor réajusté
const TripAdvisorIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm6.608 11.234a2.385 2.385 0 0 1-2.385 2.385 2.385 2.385 0 0 1-2.385-2.385 2.385 2.385 0 0 1 2.385-2.385 2.385 2.385 0 0 1 2.385 2.385zm-9.216 0A2.385 2.385 0 0 1 7.007 15.62a2.385 2.385 0 0 1-2.385-2.385 2.385 2.385 0 0 1 2.385-2.385 2.385 2.385 0 0 1 2.385 2.385zM12 17.5a4.5 4.5 0 0 1-4.182-2.835 5.485 5.485 0 0 0 8.364 0A4.5 4.5 0 0 1 12 17.5z"/>
  </svg>
)

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// Les bordures signatures de la marque
function CornerBorders() {
  return (
    <>
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-violet-500/30 pointer-events-none group-hover:border-violet-400/50 transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-violet-500/30 pointer-events-none group-hover:border-violet-400/50 transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-violet-500/30 pointer-events-none group-hover:border-violet-400/50 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-violet-500/30 pointer-events-none group-hover:border-violet-400/50 transition-colors" />
    </>
  );
}

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
    loading && setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setImporting(true);
    const toastId = toast.loading("Notre outil extrait vos précieux avis en direct...");

    try {
      const response = await fetch('/api/import-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url, spaceId: id })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Erreur lors de l'importation");

      toast.success(`Parfait ! Vos témoignages ont été synchronisés avec succès.`, { id: toastId });
      setUrl("");
      fetchData(); 

    } catch (err: any) {
      console.error("Erreur import:", err);
      toast.error("Une petite erreur est survenue", { 
        id: toastId, 
        description: "Vérifiez que le lien est correct et accessible publiquement." 
      });
    } finally {
      setImporting(false);
    }
  };

  const deleteTestimonial = (tId: string) => {
    toast("Masquer ou supprimer ce témoignage ?", {
      description: "Cette action le retirera définitivement de votre Wall of Love public.",
      action: {
        label: "Supprimer",
        onClick: () => executeDelete(tId),
      },
    });
  };

  const executeDelete = async (tId: string) => {
    const promise = supabase.from('testimonials').delete().eq('id', tId);
    toast.promise(promise as any, {
      loading: 'Retrait du témoignage...',
      success: () => { fetchData(); return 'Témoignage supprimé avec succès.'; },
      error: 'Erreur lors de la suppression.',
    });
  };

  const copyEmbedCode = () => {
    const code = `<iframe src="${window.location.origin}/spaces/${id}/wall" width="100%" height="600px" frameborder="0" style="border-radius:0px; border:1px solid rgba(255,255,255,0.1);"></iframe>`
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Code HTML copié ! Il ne vous reste plus qu'à le coller sur votre site.");
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
    </div>
  )

  return (
    <main className="min-h-screen bg-[#09090f] text-white p-6 md:p-12 antialiased selection:bg-violet-500/30">
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "45px 45px" }} />
      
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-xs font-semibold mb-3 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Retour au tableau de bord
            </button>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Espace : <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">{spaceName}</span>
            </h1>
          </div>

          <a 
            href={`/spaces/${id}/wall`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 px-5 py-3 rounded-sm font-bold transition-all text-xs text-slate-200 hover:text-white"
          >
            <Layout className="w-4 h-4 text-violet-400" />
            Voir votre Wall public
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        </div>

        {/* --- GRID PRINCIPALE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* --- BLOC IMPORTATION MAGIQUE --- */}
            <div className="p-6 bg-white/[0.01] border border-white/10 rounded-sm relative group shadow-xl shadow-black/20">
              <CornerBorders />
              <div className="mb-4">
                <h2 className="text-sm font-bold flex items-center gap-2 tracking-wide text-white uppercase">
                  <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                  Synchronisation Magique d'avis
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Collez simplement l'adresse internet de votre fiche d'établissement pour y importer automatiquement vos avis existants.
                </p>
              </div>

              <form onSubmit={handleImport} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="url" required value={url} 
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="URL Google Maps, TripAdvisor, Trustpilot..."
                    className="w-full bg-black/40 border border-white/10 rounded-sm pl-11 pr-4 py-3 text-xs focus:border-violet-500 focus:outline-none transition-all text-slate-200"
                  />
                </div>
                <button 
                  type="submit" disabled={importing} 
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-sm text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-600/10 min-w-[130px]"
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {importing ? 'Importation...' : 'Lancer l’import'}
                </button>
              </form>

              {/* Petit indicateur rassurant pour l'utilisateur */}
              <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center gap-4 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><SiGoogle className="w-3 h-3 text-red-400/70" /> Google Maps</span>
                <span className="flex items-center gap-1"><SiTrustpilot className="w-3 h-3 text-blue-400/70" /> Trustpilot</span>
                <span className="flex items-center gap-1"><TripAdvisorIcon className="w-3 h-3 text-emerald-400/70" /> TripAdvisor</span>
              </div>
            </div>

            {/* --- LISTE DES AVIS COLLECTÉS --- */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  Tous vos témoignages ({testimonials.length})
                </h2>
                <span className="text-[10px] bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-sm font-medium">
                  Modération en temps réel
                </span>
              </div>

              {testimonials.length === 0 ? (
                <div className="border border-dashed border-white/10 bg-white/[0.005] p-12 text-center rounded-sm relative group">
                  <CornerBorders />
                  <p className="text-xs text-slate-500">Aucun avis présent dans cet espace pour le moment.</p>
                  <p className="text-[11px] text-violet-400 mt-1">Partagez votre lien de collecte ou utilisez le module d'importation ci-dessus !</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <AnimatePresence mode="popLayout">
                    {testimonials.map((t) => (
                      <motion.div 
                        key={t.id} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="p-5 bg-white/[0.01] border border-white/10 rounded-sm group relative hover:border-white/20 transition-all"
                      >
                        <CornerBorders />
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 border border-white/10 bg-black flex items-center justify-center font-bold text-violet-400 text-xs uppercase rounded-sm">
                              {t.client_name ? t.client_name[0] : <User className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-sm text-slate-200 tracking-tight">{t.client_name}</h3>
                                
                                <span className={cn(
                                  "text-[9px] px-2 py-0.5 rounded-sm flex items-center gap-1 font-semibold tracking-wider border uppercase",
                                  t.platform === 'tripadvisor' && 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20',
                                  t.platform === 'trustpilot' && 'bg-blue-500/5 text-blue-400 border-blue-500/20',
                                  (t.platform === 'google' || !t.platform) && 'bg-red-500/5 text-red-400 border-red-500/20'
                                )}>
                                  {t.platform === 'tripadvisor' && <TripAdvisorIcon className="w-2.5 h-2.5" />}
                                  {t.platform === 'trustpilot' && <SiTrustpilot className="w-2.5 h-2.5" />}
                                  {(t.platform === 'google' || !t.platform) && <SiGoogle className="w-2.5 h-2.5" />}
                                  {t.platform || 'Google'}
                                </span>
                              </div>
                              <div className="flex gap-0.5 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={cn("w-3 h-3", i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-800')} />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => deleteTestimonial(t.id)} 
                            title="Retirer du mur public"
                            className="p-2 text-slate-600 hover:text-red-400 sm:opacity-0 group-hover:opacity-100 transition-all rounded-sm hover:bg-red-500/5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed font-light pl-12">"{t.content}"</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* --- COLONNE DROITE : INTEGRATION ET VENTE --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-6 bg-gradient-to-br from-violet-950/20 to-transparent border border-violet-500/20 rounded-sm relative group shadow-lg shadow-black/40">
              <CornerBorders />
              <div className="mb-4">
                <h2 className="text-base font-bold flex items-center gap-2 tracking-tight text-white">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Afficher sur votre site
                </h2>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Copiez et collez simplement ce code léger pour intégrer votre magnifique <span className="text-violet-300 font-medium">Wall of Love</span> sur n'importe quel éditeur (WordPress, Webflow, Framer, ou HTML brut).
                </p>
              </div>

              <div className="bg-[#050508] border border-white/10 rounded-sm p-4 font-mono text-[10px] text-violet-300 break-all overflow-hidden relative select-all">
                <pre className="whitespace-pre-wrap leading-relaxed">
                  {`<iframe \n  src="${typeof window !== 'undefined' ? window.location.origin : ''}/spaces/${id}/wall" \n  width="100%" \n  height="600px" \n  frameborder="0"\n  style="border-none;"\n></iframe>`}
                </pre>
              </div>

              <button 
                onClick={copyEmbedCode}
                className={cn(
                  "w-full mt-4 py-3.5 rounded-sm font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]",
                  copied 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                    : 'bg-white text-black hover:bg-slate-200 shadow-md shadow-white/5'
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> 
                    Code d'intégration copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> 
                    Copier le code HTML
                  </>
                )}
              </button>

              <div className="mt-5 p-3.5 bg-white/[0.02] border border-white/5 rounded-sm flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-normal">
                  Le widget s'adapte automatiquement à la taille des écrans de vos visiteurs de manière parfaitement fluide.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}