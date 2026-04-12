'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, Sparkles, Send } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/reset-password`,
    })

    setLoading(false)
    if (error) {
      alert(error.message)
    } else {
      setIsSent(true)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090f] text-white p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour à la connexion</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mot de passe oublié ?</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Pas de panique, ça arrive aux meilleurs. Entrez votre email pour recevoir un lien de récupération.
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="email" placeholder="votre@email.com" required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-11 focus:outline-none focus:border-violet-500 transition"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Envoyer le lien'}
            </button>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl border border-violet-500/30 bg-violet-500/5 text-center"
          >
            <Send className="text-violet-400 w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">E-mail envoyé !</h2>
            <p className="text-slate-400 text-sm">
              Consultez votre boîte mail (et vos spams) pour réinitialiser votre mot de passe.
            </p>
          </motion.div>
        )}

        <p className="mt-8 text-center text-xs text-slate-600 italic">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Sécurité garantie par TestiWall
        </p>
      </div>
    </main>
  )
}