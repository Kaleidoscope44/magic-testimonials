"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, Lock, User, ArrowLeft, Star, 
  ShieldCheck, Sparkles, Loader2, AlertCircle, CheckCircle2 
} from 'lucide-react'

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

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

const ErrorBox = ({ message }: { message: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
    className="bg-red-500/5 border border-red-500/20 text-red-400 text-xs p-3 flex items-center gap-2 mb-4 rounded-sm"
  >
    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
    <span>{message}</span>
  </motion.div>
);

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setErrorMsg(null)
  }, [isLogin])

  const translateError = (err: string) => {
    if (err.includes("Invalid login credentials")) return "L'adresse email ou le mot de passe est incorrect."
    if (err.includes("User already registered")) return "Cette adresse email est déjà enregistrée."
    if (err.includes("Password should be")) return "Le mot de passe choisi est un peu trop faible."
    return "Une petite erreur est survenue. Merci de réessayer."
  }

  const validate = () => {
    setErrorMsg(null)
    if (!isLogin && username.trim().length < 3) {
      setErrorMsg("Votre pseudo doit contenir au moins 3 caractères.")
      return false
    }
    if (password.length < 8) {
      setErrorMsg("Le mot de passe doit contenir au moins 8 caractères.")
      return false
    }
    if (!isLogin && email !== confirmEmail) {
      setErrorMsg("Les deux adresses e-mail entrées ne correspondent pas.")
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

  if (isRegistered) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#09090f] text-white p-6 antialiased">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 border border-violet-500/20 bg-white/[0.01] text-center relative rounded-sm"
        >
          <CornerBorders />
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 rounded-full">
            <CheckCircle2 className="text-emerald-400 w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold mb-3 text-white">Presque terminé !</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Un email de confirmation vient de vous être envoyé à : <br/>
            <span className="text-violet-300 font-semibold block mt-1.5">{email}</span>.
          </p>
          <p className="mt-6 text-xs text-slate-500">Pensez à jeter un œil à vos spams si le message tarde à arriver.</p>
          <button 
            onClick={() => setIsRegistered(false)} 
            className="mt-8 text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            Retourner à la page de connexion
          </button>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090f] text-white p-6 relative overflow-hidden antialiased">
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "45px 45px" }} />

      <div className="w-full max-w-sm relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors mb-6 text-xs font-medium">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour à l'accueil</span>
        </Link>

        <div className="p-8 border border-white/10 bg-white/[0.01] relative rounded-sm shadow-xl shadow-black/40">
          <CornerBorders />

          <div className="text-center mb-6">
            <div className="inline-flex w-9 h-9 border border-white/10 items-center justify-center mb-3 transform rotate-45 bg-black">
              <Star className="w-4 h-4 text-white fill-white transform -rotate-45" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {isLogin ? 'Ravi de vous revoir !' : 'Créer votre espace'}
            </h1>
            <p className="text-slate-500 mt-1.5 text-xs leading-relaxed">
              {isLogin ? 'Connectez-vous pour piloter vos témoignages.' : 'Commencez à collecter vos preuves sociales dès aujourd\'hui.'}
            </p>
          </div>

          {/* Switch Login / Sign-up Harmonieux */}
          <div className="flex border border-white/10 bg-black/40 mb-6 text-xs font-medium p-0.5 rounded-sm">
            <button 
              onClick={() => setIsLogin(true)} 
              className={cn(
                "flex-1 py-2 rounded-sm font-semibold transition-all duration-200", 
                isLogin ? "bg-white text-black shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              Connexion
            </button>
            <button 
              onClick={() => setIsLogin(false)} 
              className={cn(
                "flex-1 py-2 rounded-sm font-semibold transition-all duration-200", 
                !isLogin ? "bg-white text-black shadow-sm" : "text-slate-400 hover:text-white"
              )}
            >
              Inscription
            </button>
          </div>

          <AnimatePresence mode="wait">
            {errorMsg && <ErrorBox message={errorMsg} />}
          </AnimatePresence>

          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4 text-xs">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" placeholder="Votre prénom ou pseudo" required
                  className="w-full bg-white/[0.02] border border-white/10 py-3 px-11 focus:outline-none focus:border-violet-500 focus:bg-white/[0.04] transition rounded-sm text-slate-200"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="email" placeholder="Votre adresse e-mail" required
                className="w-full bg-white/[0.02] border border-white/10 py-3 px-11 focus:outline-none focus:border-violet-500 focus:bg-white/[0.04] transition rounded-sm text-slate-200"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!isLogin && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" placeholder="Confirmez votre e-mail" required
                  className="w-full bg-white/[0.02] border border-white/10 py-3 px-11 focus:outline-none focus:border-violet-500 focus:bg-white/[0.04] transition rounded-sm text-slate-200"
                  onChange={(e) => setConfirmEmail(e.target.value)}
                />
              </motion.div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="password" placeholder="Votre mot de passe" required
                className={cn(
                  "w-full bg-white/[0.02] py-3 px-11 focus:outline-none focus:bg-white/[0.04] transition rounded-sm text-slate-200 border",
                  password.length > 0 && password.length < 8 ? 'border-red-500/40' : 'border-white/10 focus:border-violet-500'
                )}
                onChange={(e) => setPassword(e.target.value)}
              />
              {!isLogin && password.length > 0 && password.length < 8 && (
                <p className="text-[11px] text-red-400 mt-1.5 ml-1">Le mot de passe doit faire au moins 8 caractères.</p>
              )}
            </div>

            {isLogin && (
              <div className="text-right">
                <Link href="/login/forgot-password" className="text-[11px] text-slate-500 hover:text-violet-400 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
            )}

            <button 
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 font-semibold text-sm text-white transition-all duration-200 rounded-sm hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'Me connecter' : 'Créer mon espace gratuit')}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[10px] text-slate-600 uppercase tracking-widest font-medium flex items-center justify-center gap-1.5 select-none">
          <Sparkles className="w-3 h-3 text-violet-500/60" />
          Espace sécurisé TestiWall
        </p>
      </div>
    </main>
  )
}