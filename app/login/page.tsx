'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, Lock, User, ArrowLeft, Star, 
  ShieldCheck, Sparkles, Loader2, AlertCircle, CheckCircle2 
} from 'lucide-react'

// --- Petit composant pour les messages d'erreur ---
const ErrorBox = ({ message }: { message: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2 mb-4"
  >
    <AlertCircle className="w-4 h-4 flex-shrink-0" />
    {message}
  </motion.div>
);

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Champs Formulaire
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const supabase = createClient()
  const router = useRouter()

  // Effacer l'erreur quand on change de mode (Login <-> Sign-up)
  useEffect(() => {
    setErrorMsg(null)
  }, [isLogin])

  // --- Logique de Traduction des erreurs Supabase ---
  const translateError = (err: string) => {
    if (err.includes("Invalid login credentials")) return "Email ou mot de passe incorrect."
    if (err.includes("User already registered")) return "Cet email est déjà utilisé."
    if (err.includes("Password should be")) return "Le mot de passe est trop faible."
    return "Une erreur est survenue. Veuillez réessayer."
  }

  // --- Validation avant envoi ---
  const validate = () => {
    setErrorMsg(null)
    if (!isLogin && username.trim().length < 3) {
      setErrorMsg("Le pseudo doit contenir au moins 3 caractères.")
      return false
    }
    if (password.length < 8) {
      setErrorMsg("Le mot de passe doit contenir au moins 8 caractères.")
      return false
    }
    if (!isLogin && email !== confirmEmail) {
      setErrorMsg("Les adresses e-mail ne correspondent pas.")
      return false
    }
    return true
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    })

    if (error) {
      setErrorMsg(translateError(error.message))
      setLoading(false)
    } else {
      setIsRegistered(true)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      setErrorMsg(translateError(error.message))
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  // --- ECRAN DE SUCCÈS (Après Inscription) ---
  if (isRegistered) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#09090f] text-white p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 text-center"
        >
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-400 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-emerald-50">Presque fini !</h2>
          <p className="text-slate-400 leading-relaxed text-sm">
            Un lien de confirmation a été envoyé à <br/>
            <span className="text-white font-semibold">{email}</span>.
          </p>
          <p className="mt-4 text-xs text-slate-500">Vérifiez vos spams si vous ne voyez rien.</p>
          <button 
            onClick={() => setIsRegistered(false)} 
            className="mt-8 text-sm text-slate-400 hover:text-white underline underline-offset-4"
          >
            Retour à la connexion
          </button>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090f] text-white p-6 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Accueil</span>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 shadow-lg shadow-violet-500/20">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isLogin ? 'Bon retour !' : 'Créer un compte'}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isLogin ? 'Gérez vos avis clients en toute simplicité.' : 'Commencez à collecter des preuves sociales.'}
          </p>
        </div>

        {/* Switch Login / Sign-up */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-6">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-white/10 text-white' : 'text-slate-500'}`}>
            Connexion
          </button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-white/10 text-white' : 'text-slate-500'}`}>
            Inscription
          </button>
        </div>

        <AnimatePresence mode="wait">
          {errorMsg && <ErrorBox message={errorMsg} />}
        </AnimatePresence>

        <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" placeholder="Pseudo" required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 focus:outline-none focus:border-violet-500 transition text-sm"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="email" placeholder="Adresse e-mail" required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 focus:outline-none focus:border-violet-500 transition text-sm"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {!isLogin && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="email" placeholder="Confirmez l'e-mail" required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 focus:outline-none focus:border-violet-500 transition text-sm"
                onChange={(e) => setConfirmEmail(e.target.value)}
              />
            </motion.div>
          )}

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="password" placeholder="Mot de passe" required
              className={`w-full bg-white/5 border rounded-xl py-3 px-11 focus:outline-none transition text-sm ${password.length > 0 && password.length < 8 ? 'border-red-500/50' : 'border-white/10 focus:border-violet-500'}`}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && password.length > 0 && password.length < 8 && (
              <p className="text-[10px] text-red-400 mt-1 ml-1 font-medium">Minimum 8 caractères</p>
            )}
          </div>

          {isLogin && (
            <div className="text-right">
              <Link href="/login/forgot-password" className="text-[11px] text-slate-500 hover:text-violet-400 transition">
                Mot de passe oublié ?
              </Link>
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Se connecter' : 'C’est parti !')}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-slate-600 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3" />
          TestiWall Security Verified
        </p>
      </div>
    </main>
  )
}