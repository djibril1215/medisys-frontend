import { useEffect, useState } from 'react'
import { Plus, ShieldCheck, UserCog } from 'lucide-react'
import { authApi, hopitauxApi } from '../services/api'

const roles = [
  { value: 'medecin', label: 'Medecin' },
  { value: 'urgentiste', label: 'Urgentiste' },
  { value: 'infirmier', label: 'Infirmier' },
]

export default function Admin() {
  const [users, setUsers] = useState([])
  const [hopitaux, setHopitaux] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nom: '', email: '', mot_de_passe: '', role: 'medecin', hopital_id: '' })
  const [saving, setSaving] = useState(false)

  const loadAll = () => {
    setLoading(true)
    Promise.all([authApi.get('/auth/users'), hopitauxApi.get('/hopitaux')])
      .then(([u, h]) => {
        setUsers(u.data.users)
        setHopitaux(h.data.hopitaux)
      })
      .catch(() => setError('Impossible de charger les donnees.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
  }, [])

  const nomHopital = (id) => hopitaux.find((h) => h.id === id)?.nom || '-'

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await authApi.post('/auth/register', form)
      setSuccess(`Compte cree pour ${form.nom}.`)
      setForm({ nom: '', email: '', mot_de_passe: '', role: 'medecin', hopital_id: '' })
      setShowForm(false)
      loadAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de creer ce compte.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck size={20} className="text-teal-700" /> Administration
          </h1>
          <p className="text-sm text-slate-500">Creation des comptes medecin, urgentiste et infirmier.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-950 hover:bg-teal-900 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={15} /> Nouveau compte
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3"
        >
          <input
            name="nom" required placeholder="Nom complet" value={form.nom} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          />
          <input
            name="email" required type="email" placeholder="Email" value={form.email} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          />
          <input
            name="mot_de_passe" required type="password" placeholder="Mot de passe" value={form.mot_de_passe} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          />
          <select
            name="role" required value={form.role} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <select
            name="hopital_id" required value={form.hopital_id} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 col-span-2"
          >
            <option value="">Rattacher a un hopital</option>
            {hopitaux.map((h) => (
              <option key={h.id} value={h.id}>{h.nom}</option>
            ))}
          </select>

          <button
            type="submit" disabled={saving}
            className="col-span-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-60"
          >
            {saving ? 'Creation...' : 'Creer le compte'}
          </button>
        </form>
      )}

      {loading && <p className="text-sm text-slate-400 mb-4">Chargement...</p>}
      {error && <p className="text-sm text-rose-600 mb-4">{error}</p>}
      {success && <p className="text-sm text-emerald-600 mb-4">{success}</p>}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-2 font-medium">Nom</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Hopital</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-2.5 text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
                    <UserCog size={12} />
                  </div>
                  {u.nom}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{u.email}</td>
                <td className="px-4 py-2.5 text-slate-500 capitalize">{u.role.replace('_', ' ')}</td>
                <td className="px-4 py-2.5 text-slate-500">
                  {u.role === 'super_admin' ? '-' : nomHopital(u.hopital_id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
