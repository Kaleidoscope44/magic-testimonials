'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner' // Import de sonner
import { 
  LayoutDashboard, Plus, MessageSquare, Eye, 
  LogOut, Star, TrendingUp, 
  Trash2, Copy, ExternalLink, Loader2, Zap,
  Globe, ShieldCheck
} from 'lucide-react'

// --- Composant interne pour les cartes de statistiques ---
function StatCard({ title, value, icon: Icon, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }} 
      className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-violet-500/20 rounded-xl">
          <Icon className="w-5 h-5 text-violet-400" />
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase tracking-wider">
            {trend}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
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
      toast.success("Espace créé avec succès !")
      setNewSpaceName('')
      fetchData(user.id)
    } else {
      toast.error("Erreur : Ce nom est peut-être déjà utilisé pour un slug.")
    }
    setIsCreating(false)
  }

  // --- NOUVELLE FONCTION DE SUPPRESSION AVEC CONFIRMATION TOAST ---
  const deleteSpace = async (spaceId: string) => {
    toast("Supprimer ce projet ?", {
      description: "Cela supprimera définitivement tous les témoignages associés.",
      action: {
        label: "Supprimer",
        onClick: async () => {
          const promise = supabase.from('spaces').delete().eq('id', spaceId);
          
          toast.promise(promise as any, {
            loading: 'Suppression...',
            success: () => {
              fetchData(user.id);
              return 'Projet supprimé.';
            },
            error: (err: any) => `Erreur: ${err.message}`,
          });
        },
      },
      //cancel: { label: "Annuler" },
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
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  )

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || "l'ami"

  return (
    <div className="min-h-screen bg-[#09090f] text-white flex flex-col font-sans antialiased">
      <header className="border-b border-white/5 bg-[#09090f]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">TestiWall</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white capitalize">{username}</p>
              <p className="text-[10px] text-violet-400 uppercase tracking-widest font-bold">Plan Pro</p>
            </div>
            <button onClick={handleLogout} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <section className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-3xl md:text-4xl font-black mb-2">
                Salut, <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent capitalize">{username} !</span> 👋
              </h1>
              <p className="text-slate-400">Votre centre de commande de réputation.</p>
            </motion.div>
            <form onSubmit={createSpace} className="flex gap-2 w-full lg:max-w-md">
              <input 
                type="text" 
                value={newSpaceName} 
                onChange={(e) => setNewSpaceName(e.target.value)}
                placeholder="Nom du nouveau projet..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-500 transition text-sm"
              />
              <button 
                type="submit" disabled={isCreating}
                className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-2xl font-bold transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-violet-600/20"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Créer
              </button>
            </form>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Projets Actifs" value={spaces.length} icon={LayoutDashboard} />
          <StatCard title="Avis Totaux" value={totalReviews} icon={MessageSquare} trend="Reçus" />
          <StatCard title="Vues Totales" value={totalViews} icon={Eye} trend="Live" />
          <StatCard title="Conversion" value={`${conversionRate}%`} icon={TrendingUp} />
        </section>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200 uppercase tracking-widest text-xs">
            <Zap className="w-4 h-4 text-violet-400" /> Mes Espaces
          </h2>
        </div>

        {spaces.length === 0 ? (
          <section className="bg-white/5 border border-dashed border-white/10 rounded-[40px] p-16 text-center">
            <LayoutDashboard className="w-10 h-10 text-slate-700 mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-2 text-slate-300">Lancez votre premier mur</h3>
            <p className="text-slate-500">Créez un espace pour commencer à collecter des avis.</p>
          </section>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {spaces.map((space) => (
                <motion.div 
                  key={space.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 border border-white/10 rounded-[32px] p-8 hover:border-violet-500/50 transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold group-hover:text-violet-400 transition">{space.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Slug: {space.slug}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                        <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {space.views || 0} vues
                        </span>
                      </div>
                    </div>
                    <button onClick={() => deleteSpace(space.id)} className="p-2 text-slate-600 hover:text-red-400 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                      <p className="text-[9px] text-slate-500 uppercase font-black mb-1 tracking-widest">Collecte</p>
                      <button 
                        onClick={() => copyToClipboard(`${window.location.origin}/collect/${space.slug}`, "Lien de collecte copié !")}
                        className="flex items-center gap-2 text-[11px] text-emerald-400 hover:text-emerald-300 transition font-mono truncate"
                      >
                        <Copy className="w-3 h-3" /> Copier le lien
                      </button>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                      <p className="text-[9px] text-slate-500 uppercase font-black mb-1 tracking-widest">Wall of Love</p>
                      <button 
                        onClick={() => copyToClipboard(`${window.location.origin}/spaces/${space.id}/wall`, "Lien du mur copié !")}
                        className="flex items-center gap-2 text-[11px] text-violet-400 hover:text-violet-300 transition font-mono truncate"
                      >
                        <Copy className="w-3 h-3" /> Copier le lien
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => router.push(`/spaces/${space.id}`)}
                      className="flex-1 bg-white text-black py-4 rounded-2xl text-sm font-black hover:bg-violet-500 hover:text-white transition-all shadow-xl shadow-white/5"
                    >
                      Gérer & Modérer
                    </button>
                    <a 
                      href={`/spaces/${space.id}/wall`} 
                      target="_blank"
                      className="p-4 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-2xl hover:bg-violet-600 hover:text-white transition group-hover:scale-105"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer className="py-10 text-center text-slate-700 text-[10px] uppercase tracking-[0.4em] font-bold border-t border-white/5">
        © 2026 TestiWall • Secured by <ShieldCheck className="inline w-3 h-3 ml-1" />
      </footer>
    </div>
  )
}