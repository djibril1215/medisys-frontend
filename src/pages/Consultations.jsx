import { useEffect, useState } from 'react'
import { Plus, CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { consultationsApi, patientsApi, personnelApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Badge({ statut }) {
  const map = {
    confirme: { tone: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Confirme' },
    annule: { tone: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle, label: 'Annule' },
  }
  const { tone, icon: Icon, label } = map[statut] || {
    tone: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock3, label: statut,
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${tone}`}>
      <Icon size={11} /> {label}
    </span>
  )
}

export default function Consultations() {
  const { user } = useAuth()
  const estMedecin = user?.role === 'medecin'

  const [consultations, setConsultations] = useState([])
  const [patients, setPatients] = useState([])
  const [personnel, setPersonnel] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ patient_id: '', personnel_id: '', date_consultation: '', motif: '' })
  const [saving, setSaving] = useState(false)

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      consultationsApi.get('/consultations'),
      patientsApi.get('/patients'),
      personnelApi.get('/personnel'),
    ])
      .then(([c, p, s]) => {
        setConsultations(c.data.consultations)
        setPatients(p.data.patients)
        setPersonnel(s.data.personnel)
      })
      .catch(() => setError('Impossible de charger les donnees.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
  }, [])

  const nomPatient = (id) => {
    const p = patients.find((x) => x.id === id)
    return p ? `${p.prenom} ${p.nom}` : `#${id}`
  }
  const nomPersonnel = (id) => {
    const p = personnel.find((x) => x.id === id)
    return p ? `${p.prenom} ${p.nom}` : `#${id}`
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await consultationsApi.post('/consultations', form)
      setForm({ patient_id: '', personnel_id: '', date_consultation: '', motif: '' })
      setShowForm(false)
      loadAll()
    } catch {
      setError('Impossible de creer la consultation.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async (id) => {
    try {
      await consultationsApi.patch(`/consultations/${id}/cancel`)
      loadAll()
    } catch {
      setError("Impossible d'annuler la consultation.")
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Consultations</h1>
          <p className="text-sm text-slate-500">Rendez-vous et suivi des statuts.</p>
        </div>
        {estMedecin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-teal-950 hover:bg-teal-900 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={15} /> Nouvelle consultation
          </button>
        )}
      </div>

      {!estMedecin && (
        <p className="text-xs text-slate-400 mb-4">
          Seul un medecin peut creer ou annuler une consultation. Vous etes en lecture seule.
        </p>
      )}

      {showForm && estMedecin && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3"
        >
          <select
            name="patient_id" required value={form.patient_id} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          >
            <option value="">Selectionner un patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
            ))}
          </select>

          <select
            name="personnel_id" required value={form.personnel_id} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          >
            <option value="">Selectionner un medecin</option>
            {personnel.map((p) => (
              <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
            ))}
          </select>

          <input
            name="date_consultation" required type="datetime-local"
            value={form.date_consultation} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          />
          <input
            name="motif" placeholder="Motif" value={form.motif} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          />

          <button
            type="submit" disabled={saving}
            className="col-span-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-60"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      )}

      {loading && <p className="text-sm text-slate-400">Chargement...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-2 font-medium">Patient</th>
              <th className="px-4 py-2 font-medium">Medecin</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Statut</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-2.5 text-slate-800">{nomPatient(c.patient_id)}</td>
                <td className="px-4 py-2.5 text-slate-500">{nomPersonnel(c.personnel_id)}</td>
                <td className="px-4 py-2.5 text-slate-500">
                  {new Date(c.date_consultation).toLocaleString('fr-FR')}
                </td>
                <td className="px-4 py-2.5"><Badge statut={c.statut} /></td>
                <td className="px-4 py-2.5 text-right">
                  {estMedecin && c.statut === 'confirme' && (
                    <button
                      onClick={() => handleCancel(c.id)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Annuler
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
