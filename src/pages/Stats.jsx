import { useEffect, useState } from 'react'
import { Users, CalendarDays, Stethoscope, CheckCircle2, XCircle, Clock3 } from 'lucide-react'
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

function StatusBar({ label, value, total, color, icon: Icon }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-700 flex items-center gap-1.5">
          <Icon size={13} /> {label}
        </span>
        <span
          className="text-sm text-slate-500"
          style={{ fontFamily: 'ui-monospace, monospace' }}
        >
          {value} ({pct}%)
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [byStatus, setByStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      statsApi.get('/stats/dashboard'),
      statsApi.get('/stats/consultations-by-status'),
    ])
      .then(([d, s]) => {
        setStats(d.data)
        setByStatus(s.data.consultations_par_statut)
      })
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false))
  }, [])

  const total = byStatus
    ? Object.values(byStatus).reduce((a, b) => a + b, 0)
    : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Statistiques</h1>
        <p className="text-sm text-slate-500">Vue consolidee de l'activite du reseau.</p>
      </div>

      {loading && <p className="text-sm text-slate-400">Chargement...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Patients" value={stats.total_patients} icon={Users} />
            <MetricCard label="Personnel" value={stats.total_personnel} icon={Stethoscope} />
            <MetricCard label="Consultations" value={stats.total_consultations} icon={CalendarDays} />
            <MetricCard label="Confirmees" value={stats.consultations_confirmees} icon={CheckCircle2} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">
                Repartition des consultations par statut
              </h2>
              {byStatus && (
                <>
                  <StatusBar
                    label="Confirmees" icon={CheckCircle2}
                    value={byStatus.confirme || 0} total={total} color="bg-emerald-500"
                  />
                  <StatusBar
                    label="En attente" icon={Clock3}
                    value={byStatus.en_attente || 0} total={total} color="bg-amber-500"
                  />
                  <StatusBar
                    label="Annulees" icon={XCircle}
                    value={byStatus.annule || 0} total={total} color="bg-rose-500"
                  />
                </>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Resume</h2>
              <ul className="text-sm text-slate-600 flex flex-col gap-2">
                <li className="flex justify-between">
                  <span>Consultations confirmees</span>
                  <span className="font-medium text-slate-900">{stats.consultations_confirmees}</span>
                </li>
                <li className="flex justify-between">
                  <span>Consultations annulees</span>
                  <span className="font-medium text-slate-900">{stats.consultations_annulees}</span>
                </li>
                <li className="flex justify-between">
                  <span>Total patients suivis</span>
                  <span className="font-medium text-slate-900">{stats.total_patients}</span>
                </li>
                <li className="flex justify-between">
                  <span>Membres du personnel actifs</span>
                  <span className="font-medium text-slate-900">{stats.total_personnel}</span>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
