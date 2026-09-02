import { useEffect, useState } from 'react'
import { Plus, Stethoscope } from 'lucide-react'
import { personnelApi } from '../services/api'

export default function Personnel() {
  const [personnel, setPersonnel] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '', poste: '', role: '', equipe: '',
  })
  const [saving, setSaving] = useState(false)

  const loadPersonnel = () => {
    setLoading(true)
    personnelApi
      .get('/personnel')
      .then(({ data }) => setPersonnel(data.personnel))
      .catch(() => setError('Impossible de charger le personnel.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPersonnel()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await personnelApi.post('/', form)
      setForm({ nom: '', prenom: '', email: '', telephone: '', poste: '', role: '', equipe: '' })
      setShowForm(false)
      loadPersonnel()
    } catch {
      setError('Impossible de creer le membre du personnel.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Personnel</h1>
          <p className="text-sm text-slate-500">Profils, roles et equipes de l'etablissement.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-950 hover:bg-teal-900 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={15} /> Nouveau membre
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3"
        >
          <input
            name="nom" required placeholder="Nom" value={form.nom} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          />
          <input
            name="prenom" required placeholder="Prenom" value={form.prenom} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          />
          <input
            name="email" required type="email" placeholder="Email" value={form.email} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          />
          <input
            name="telephone" placeholder="Telephone" value={form.telephone} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          />
          <input
            name="poste" placeholder="Poste (ex. Medecin, Infirmier)" value={form.poste} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          />
          <input
            name="role" placeholder="Role (ex. medecin, infirmier)" value={form.role} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
          />
          <input
            name="equipe" placeholder="Equipe (ex. Urgences)" value={form.equipe} onChange={handleChange}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 col-span-2"
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
              <th className="px-4 py-2 font-medium">Nom</th>
              <th className="px-4 py-2 font-medium">Poste</th>
              <th className="px-4 py-2 font-medium">Equipe</th>
              <th className="px-4 py-2 font-medium">Email</th>
            </tr>
          </thead>
          <tbody>
            {personnel.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-2.5 text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Stethoscope size={12} />
                  </div>
                  {p.prenom} {p.nom}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{p.poste || '-'}</td>
                <td className="px-4 py-2.5 text-slate-500">{p.equipe || '-'}</td>
                <td className="px-4 py-2.5 text-slate-500">{p.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
