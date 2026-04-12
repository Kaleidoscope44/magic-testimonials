'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner' // Ajouté
import { 
  ArrowLeft, Star, Trash2, ExternalLink, 
  Code, MessageSquare, Calendar, User, 
  Copy, Check, Loader2, Sparkles, Layout,
  Link as LinkIcon, Plus
} from 'lucide-react'

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

  // --- FONCTION IMPORTATION STYLÉE ---
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setImporting(true);
    // On lance un toast de chargement persistant
    const toastId = toast.loading("Le robot explore Google Maps pour vous...");

    try {
      const response = await fetch('/api/import-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url, spaceId: id })
      });

      const reviews = await response.json();

      if (!response.ok) throw new Error(reviews.error || "Erreur lors de l'import");

      if (Array.isArray(reviews)) {
        const { error } = await supabase
          .from('testimonials')
          .upsert(reviews, { 
            onConflict: 'client_name,content,space_id', 
            ignoreDuplicates: true 
          });

        if (error) throw error;
        
        // On remplace le toast de chargement par un succès
        toast.success(`Succès ! ${reviews.length} avis ont été synchronisés.`, {
          id: toastId,
          description: "Les doublons ont été automatiquement filtrés.",
        });

        setUrl("");
        fetchData();
      }
    } catch (err: any) {
      toast.error("Oups ! L'importation a échoué", {
        id: toastId,
        description: err.message
      });
    } finally {
      setImporting(false);
    }
  };

  // --- SUPPRESSION STYLÉE ---
  const deleteTestimonial = async (tId: string) => {
    // On garde un confirm simple mais on utilise toast.promise pour le retour
    if (!confirm("Voulez-vous vraiment supprimer ce témoignage ?")) return
    
    const promise = supabase.from('testimonials').delete().eq('id', tId);

    toast.promise(promise, {
      loading: 'Suppression en cours...',
      success: () => {
        fetchData();
        return 'Témoignage supprimé du mur.';
      },
      error: 'Erreur lors de la suppression.',
    });
  }

  const copyEmbedCode = () => {
    const code = `<iframe src="${window.location.origin}/spaces/${id}/wall" width="100%" height="600px" frameborder="0"></iframe>`
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.info("Code d'intégration copié !"); // Notification supplémentaire
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  )

  return (
    <main className="min-h-screen bg-[#09090f] text-white p-6 md:p-12 font-sans">
      <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition text-sm mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retour au dashboard
            </button>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Gestion : <span className="text-violet-400">{spaceName}</span>
            </h1>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <a 
              href={`/spaces/${id}/wall`} 
              target="_blank" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2.5 rounded-xl font-bold transition text-sm"
            >
              <Layout className="w-4 h-4" />
              Voir le Wall
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* --- BLOC IMPORT --- */}
            <div className="p-1 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-[32px]">
              <div className="bg-[#0c0c14] p-6 rounded-[31px]">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  Importation Magique
                </h2>
                <form onSubmit={handleImport} className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="url" 
                      required 
                      value={url} 
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Lien Google Maps..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none transition"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={importing}
                    className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-violet-900/20 min-w-[140px]"
                  >
                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {importing ? 'Import...' : 'Importer'}
                  </button>
                </form>
              </div>
            </div>

            {/* --- LISTE DES TÉMOIGNAGES --- */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Témoignages ({testimonials.length})
              </h2>

              <AnimatePresence mode="popLayout">
                {testimonials.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-12 border border-dashed border-white/10 rounded-[32px] text-center bg-white/[0.02]"
                  >
                    <p className="text-slate-500 italic">Aucun avis reçu pour le moment...</p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {testimonials.map((t) => (
                      <motion.div 
                        key={t.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -4, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                        className="p-6 bg-white/5 border border-white/10 rounded-[24px] transition-colors relative group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center border border-violet-500/30 font-bold text-violet-400 text-xs">
                              {t.client_name ? t.client_name[0].toUpperCase() : <User className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-100">{t.client_name}</h3>
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 uppercase font-black tracking-widest border border-violet-500/20">
                                  {t.platform || 'Google'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < t.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteTestimonial(t.id)}
                            className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed italic">
                          "{t.content}"
                        </p>
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                          <Calendar className="w-3 h-3 mr-1" />
                          Reçu le {new Date(t.created_at).toLocaleDateString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* COLONNE DROITE (INTÉGRATION) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
               <div className="p-6 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 border border-violet-500/20 rounded-[32px] overflow-hidden relative group">
                 <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                   <Sparkles className="w-5 h-5 text-violet-400" />
                   Intégration
                 </h2>
                 <p className="text-slate-400 text-xs mb-6">
                   Affichez ce mur d'avis sur votre propre site web.
                 </p>
                 <div className="bg-[#050508] border border-white/10 rounded-2xl p-4 font-mono text-[10px] text-violet-300 break-all">
                   <pre className="whitespace-pre-wrap">
                     {`<iframe \n  src="${typeof window !== 'undefined' ? window.location.origin : ''}/spaces/${id}/wall" \n  width="100%" \n  height="600px" \n  frameborder="0"\n></iframe>`}
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
      </div>
    </main>
  )
}