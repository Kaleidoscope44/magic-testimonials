'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase'
import { ShieldCheck, Calendar, Globe, Fingerprint } from 'lucide-react'

export default function VerifyPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProof = async () => {
      const { data } = await supabase
        .from('testimonials')
        .select('*, spaces(name)')
        .eq('id', id)
        .single()
      setData(data)
    }
    fetchProof()
  }, [id])

  if (!data) return <div className="p-20 text-center">Chargement de la preuve...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Certificat d'Authenticité</h1>
          <p className="text-slate-500 text-sm">Témoignage vérifié par TestiWall Protocol</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <Calendar className="text-violet-500 w-5 h-5" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Date de collecte</p>
              <p className="text-sm font-semibold">{new Date(data.created_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <Globe className="text-violet-500 w-5 h-5" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Destinataire</p>
              <p className="text-sm font-semibold">{data.spaces?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <Fingerprint className="text-violet-500 w-5 h-5" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">ID de Transaction</p>
              <p className="text-[11px] font-mono text-slate-600 truncate w-40">{data.id}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-dashed border-slate-200 text-center italic text-slate-500 text-sm">
          "{data.content}"
          <p className="mt-2 font-bold not-italic text-slate-900">— {data.client_name}</p>
        </div>
      </div>
    </div>
  )
}
