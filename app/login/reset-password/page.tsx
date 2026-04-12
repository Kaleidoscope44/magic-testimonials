'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Loader2, CheckCircle, ShieldCheck } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.")
      return
    }

    setLoading(true)

    // C'est ici que la magie opère
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    setLoading(false)

    if (error) {
      alert("Erreur : " + error.message)
    } else {
      setIsSuccess(true)
      // On attend 3 secondes pour que l'utilisateur voit le succès, puis direction login
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090f] text-white p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Nouveau mot de passe</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Choisissez un mot de passe robuste pour protéger votre compte.
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="password" placeholder="Nouveau mot de passe" required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 focus:outline-none focus:border-violet-500 transition"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="password" placeholder="Confirmez le mot de passe" required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 focus:outline-none focus:border-violet-500 transition"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Mettre à jour'}
            </button>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 text-center"
          >
            <CheckCircle className="text-emerald-400 w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Mot de passe mis à jour !</h2>
            <p className="text-slate-400 text-sm">
              Votre mot de passe a été modifié. Redirection vers la page de connexion...
            </p>
          </motion.div>
        )}
      </div>
    </main>
  )
}