import { useEffect, useState } from 'react'
import { Users, CalendarDays, Stethoscope, Share2, CheckCircle2, Clock3, ArrowUpRight } from 'lucide-react'
import { statsApi } from '../services/api'

function MetricCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        <Icon size={16} className="text-slate-400" />
      </div>
      <div
        className="text-2xl font-semibold text-slate-900"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
      >
        {value}
      </div>
    </div>
  )
}

function Badge({ tone, children }) {
  const tones = {
    confirme: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    annule: 'bg-rose-50 text-rose-700 border-rose-200',
    en_attente: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${
        tones[tone] || 'bg-slate-100 text-slate-600 border-slate-200'
      }`}
    >
      {tone === 'confirme' && <CheckCircle2 size={11} />}
      {tone === 'en_attente' && <Clock3 size={11} />}
      {children}
    </span>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi
      .get('/stats/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => setError("Impossible de charger les statistiques. Verifiez que les microservices tournent."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-slate-500">Vue d'ensemble de l'activite du reseau.</p>
      </div>

      {loading && <p className="text-sm text-slate-400">Chargement...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Patients" value={stats.total_patients} icon={Users} />
          <MetricCard label="Consultations" value={stats.total_consultations} icon={CalendarDays} />
          <MetricCard label="Personnel" value={stats.total_personnel} icon={Stethoscope} />
          <MetricCard label="Confirmees" value={stats.consultations_confirmees} icon={ArrowUpRight} />
        </div>
      )}
    </div>
  )
}
