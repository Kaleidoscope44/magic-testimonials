'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  LayoutDashboard, Plus, MessageSquare, Eye, 
  LogOut, Star, TrendingUp, 
  Trash2, Copy, ExternalLink, Loader2, Zap,
  Globe, ShieldCheck, HelpCircle, ArrowRight
} from 'lucide-react'

// --- Simple Utility function pour fusionner les classes ---
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- Les petits détails angulaires de marque ---
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

// --- Composant pour les cartes de statistiques ---
function StatCard({ title, value, icon: Icon, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -2 }} 
      className="bg-white/[0.01] border border-white/10 p-6 rounded-sm backdrop-blur-sm relative group"
    >
      <CornerBorders />
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 border border-white/10 bg-black rounded-sm">
          <Icon className="w-4 h-4 text-violet-400" />
        </div>
        {trend && (
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 px-2 py-0.5 rounded-sm tracking-wide">
            {trend}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-xs font-medium tracking-wide">{title}</p>
      <h3 className="text-2xl font-bold mt-1 text-white tracking-tight">{value}</h3>
    </motion.div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [spaces, setSpaces] = useState<any[]>([])
  const [newSpaceName, setNewSpaceName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [totalViews, setTotalViews] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
      } else {
        setUser(user)
        fetchData(user.id)
      }
    }
    checkUser()
  }, [router])

  const fetchData = async (userId: string) => {
    setLoading(true)
    const { data: spacesData } = await supabase
      .from('spaces')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
    
    if (spacesData) {
      setSpaces(spacesData)
      const viewsSum = spacesData.reduce((acc, curr) => acc + (curr.views || 0), 0)
      setTotalViews(viewsSum)

      const spaceIds = spacesData.map(s => s.id)
      if (spaceIds.length > 0) {
        const { count } = await supabase
          .from('testimonials')
          .select('*', { count: 'exact', head: true })
          .in('space_id', spaceIds)
        setTotalReviews(count || 0)
      }
    }
    setLoading(false)
  }

  const conversionRate = totalViews > 0 
    ? ((totalReviews / totalViews) * 100).toFixed(1) 
    : "0"

  const createSpace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSpaceName.trim()) return
    setIsCreating(true)

    const slug = newSpaceName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    
    const { error } = await supabase
      .from('spaces')
      .insert([{ 
        name: newSpaceName, 
        slug: slug,
        owner_id: user.id 
      }])
    
    if (!error) {
      toast.success("Votre nouvel espace a été créé avec succès !")
      setNewSpaceName('')
      fetchData(user.id)
    } else {
      toast.error("Oups, ce nom génère un lien déjà utilisé. Essayez une légère variante !")
    }
    setIsCreating(false)
  }

  const deleteSpace = async (spaceId: string) => {
    toast("Supprimer cet espace ?", {
      description: "Cette action supprimera définitivement l'espace ainsi que tous les précieux témoignages associés.",
      action: {
        label: "Confirmer",
        onClick: async () => {
          const promise = supabase.from('spaces').delete().eq('id', spaceId);
          
          toast.promise(promise as any, {
            loading: 'Suppression en cours...',
            success: () => {
              fetchData(user.id);
              return 'L’espace a bien été retiré.';
            },
            error: (err: any) => `Erreur : ${err.message}`,
          });
        },
      },
    });
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  }

  if (loading && !user) return (
    <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
    </div>
  )

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || "l'ami"

  return (
    <div className="min-h-screen bg-[#09090f] text-white flex flex-col antialiased selection:bg-violet-500/30">
      {/* Background Grid Lines discrètes */}
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "45px 45px" }} />

      {/* Header */}
      <header className="border-b border-white/5 bg-[#09090f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center transform rotate-45">
              <Star className="w-3.5 h-3.5 text-white fill-white transform -rotate-45" />
            </div>
            <span className="font-bold text-base tracking-tight">Testi<span className="text-violet-400">Wall</span></span>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white capitalize">{username}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-violet-400 font-medium bg-violet-400/5 border border-violet-500/20 px-1.5 py-0.5 rounded-sm mt-0.5">
                <span className="w-1 h-1 bg-violet-400 rounded-full animate-pulse" /> Plan Pro
              </span>
            </div>
            <button 
              onClick={handleLogout} 
              title="Se déconnecter"
              className="p-2.5 bg-white/[0.02] border border-white/10 rounded-sm hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full relative z-10">
        
        {/* Welcome and Action Bar */}
        <section className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Ravi de vous voir, <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent capitalize">{username}</span> ✨
              </h1>
              <p className="text-slate-400 text-xs mt-1">Prêt à collecter de nouvelles preuves sociales et rassurer vos clients ?</p>
            </motion.div>
            
            <form onSubmit={createSpace} className="flex gap-2 w-full lg:max-w-md">
              <input 
                type="text" 
                value={newSpaceName} 
                onChange={(e) => setNewSpaceName(e.target.value)}
                placeholder="Nom de votre nouveau projet (ex: Agence, Mon SaaS...)"
                className="flex-1 bg-white/[0.02] border border-white/10 rounded-sm px-4 py-3 focus:outline-none focus:border-violet-500 focus:bg-white/[0.04] transition text-xs tracking-wide"
              />
              <button 
                type="submit" disabled={isCreating}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-5 py-3 rounded-sm text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 text-white shadow-md shadow-violet-600/10"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Créer l'espace
              </button>
            </form>
          </div>
        </section>

        {/* Quick Guide Guide d'embarquement simple */}
        {spaces.length > 0 && (
          <section className="mb-10 p-5 bg-gradient-to-r from-violet-950/10 to-transparent border border-violet-500/20 rounded-sm relative group">
            <CornerBorders />
            <div className="flex gap-3 items-start">
              <div className="p-1.5 border border-violet-500/30 bg-black text-violet-400 rounded-sm mt-0.5">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-wide uppercase text-violet-300">Comment démarrer en 1 minute ?</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-3xl">
                  C'est très simple : <strong className="text-slate-200">1.</strong> Copiez le <span className="text-emerald-400 font-medium">Lien de Collecte</span> ci-dessous et partagez-le avec vos clients pour recevoir des avis. <strong className="text-slate-200">2.</strong> Une fois reçus, modérez-les et copiez le lien du <span className="text-violet-400 font-medium">Wall of Love</span> pour l'intégrer sur votre site internet !
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard title="Espaces Actifs" value={spaces.length} icon={LayoutDashboard} />
          <StatCard title="Avis Collectés" value={totalReviews} icon={MessageSquare} trend="Total" />
          <StatCard title="Vues Uniques" value={totalViews} icon={Eye} trend="Live" />
          <StatCard title="Taux de Conversion moyen" value={`${conversionRate}%`} icon={TrendingUp} />
        </section>

        {/* Section Title */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2 text-slate-400 uppercase tracking-widest text-[11px]">
            <Zap className="w-3.5 h-3.5 text-violet-400 animate-pulse" /> Vos espaces de confiance
          </h2>
        </div>

        {/* Empty State */}
        {spaces.length === 0 ? (
          <section className="border border-dashed border-white/10 bg-white/[0.01] rounded-sm p-16 text-center max-w-2xl mx-auto relative group">
            <CornerBorders />
            <div className="w-10 h-10 border border-white/5 bg-black flex items-center justify-center mx-auto mb-4 text-slate-500">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-1.5 text-slate-200">Lancez votre premier mur d'amour client</h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed mb-6">
              Entrez simplement un nom de projet en haut à droite pour générer instantanément vos premiers liens de collecte et votre mur de témoignages.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-400 bg-violet-400/5 border border-violet-500/20 px-3 py-1 rounded-sm">
              <span className="w-1 h-1 bg-emerald-400 rounded-full inline-block animate-ping" />
              Prêt et disponible instantanément
            </div>
          </section>
        ) : (
          /* Spaces Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence mode="popLayout">
              {spaces.map((space) => (
                <motion.div 
                  key={space.id} 
                  layout 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white/[0.01] border border-white/10 rounded-sm p-6 hover:border-white/20 transition-all group relative overflow-hidden flex flex-col justify-between"
                >
                  <CornerBorders />
                  
                  <div>
                    {/* Card Top */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors tracking-tight">{space.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] text-slate-500 font-mono">Lien unique : /collect/{space.slug}</span>
                          <span className="w-1 h-1 bg-slate-800 rounded-full" />
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-400/5 px-1.5 py-0.2 rounded-sm border border-emerald-500/10">
                            <Eye className="w-3 h-3" /> {space.views || 0} visiteurs
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteSpace(space.id)} 
                        title="Supprimer le projet"
                        className="p-2 text-slate-600 hover:text-red-400 transition-colors rounded-sm hover:bg-red-500/5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  
                    {/* Action Links / Copy Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                      <div className="bg-black/40 border border-white/5 rounded-sm p-3 flex flex-col justify-center">
                        <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">1. Lien de Collecte clients</p>
                        <button 
                          onClick={() => copyToClipboard(`${window.location.origin}/collect/${space.slug}`, "Le lien de collecte a été copié ! Envoyez-le à vos clients.")}
                          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors text-left"
                        >
                          <Copy className="w-3 h-3" /> Copier l'URL de collecte
                        </button>
                      </div>
                      <div className="bg-black/40 border border-white/5 rounded-sm p-3 flex flex-col justify-center">
                        <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-wider">2. Lien de votre Wall of Love</p>
                        <button 
                          onClick={() => copyToClipboard(`${window.location.origin}/spaces/${space.id}/wall`, "Lien du mur d'avis copié ! Vous pouvez l'intégrer sur votre site.")}
                          className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors text-left"
                        >
                          <Copy className="w-3 h-3" /> Copier l'URL du mur public
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <button 
                      onClick={() => router.push(`/spaces/${space.id}`)}
                      className="flex-1 bg-white text-black py-3 rounded-sm text-xs font-bold hover:bg-violet-600 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-white/5"
                    >
                      Gérer & Modérer les avis
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <a 
                      href={`/spaces/${space.id}/wall`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Voir le mur en ligne"
                      className="p-3 bg-violet-600/5 border border-violet-500/20 text-violet-400 rounded-sm hover:bg-violet-600 hover:text-white transition-all flex items-center justify-center"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-600 text-[10px] uppercase tracking-[0.3em] font-medium border-t border-white/5 relative z-10">
        © {new Date().getFullYear()} TestiWall • Sécurisé de bout en bout <ShieldCheck className="inline w-3 h-3 ml-1 text-slate-500" />
      </footer>
    </div>
  )
}