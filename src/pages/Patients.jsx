import { useEffect, useState } from 'react'
import { Plus, User } from 'lucide-react'
import { patientsApi } from '../services/api'

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [form, setForm] = useState({
    nom: '', prenom: '', date_naissance: '', sexe: '', telephone: '', adresse: '',
    antecedents_medicaux: '', allergies: '',
  })
  const [saving, setSaving] = useState(false)

  const loadPatients = () => {
    setLoading(true)
    patientsApi
      .get('/patients')
      .then(({ data }) => setPatients(data.patients))
      .catch(() => setError('Impossible de charger les patients.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await patientsApi.post('/patients', form)
      setForm({
        nom: '', prenom: '', date_naissance: '', sexe: '', telephone: '', adresse: '',
        antecedents_medicaux: '', allergies: '',
      })
      setShowForm(false)
      loadPatients()
    } catch {
      setError('Impossible de creer le patient.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Patients</h1>
          <p className="text-sm text-slate-500">Dossiers patients de l'etablissement.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-950 hover:bg-teal-900 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={15} /> Nouveau patient
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4"
        >
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Nom</label>
            <input
              name="nom" required value={form.nom} onChange={handleChange}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Prenom</label>
            <input
              name="prenom" required value={form.prenom} onChange={handleChange}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Date de naissance</label>
            <input
              name="date_naissance" type="date" value={form.date_naissance} onChange={handleChange}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Sexe</label>
            <select
              name="sexe" value={form.sexe} onChange={handleChange}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 w-full"
            >
              <option value="">Non precise</option>
              <option value="M">Masculin</option>
              <option value="F">Feminin</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Telephone</label>
            <input
              name="telephone" value={form.telephone} onChange={handleChange}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Adresse</label>
            <input
              name="adresse" value={form.adresse} onChange={handleChange}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 w-full"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Antecedents medicaux</label>
            <textarea
              name="antecedents_medicaux" rows={2} value={form.antecedents_medicaux} onChange={handleChange}
              placeholder="Ex. Hypertension, diabete de type 2..."
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 w-full resize-none"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Allergies</label>
            <textarea
              name="allergies" rows={2} value={form.allergies} onChange={handleChange}
              placeholder="Ex. Penicilline, arachides..."
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 w-full resize-none"
            />
          </div>

          <button
            type="submit" disabled={saving}
            className="col-span-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60"
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
              <th className="px-4 py-2 font-medium">Telephone</th>
              <th className="px-4 py-2 font-medium">Adresse</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <>
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
                      <User size={12} />
                    </div>
                    {p.prenom} {p.nom}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{p.telephone || '-'}</td>
                  <td className="px-4 py-2.5 text-slate-500">{p.adresse || '-'}</td>
                  <td className="px-4 py-2.5 text-right">
                    {(p.antecedents_medicaux || p.allergies) && (
                      <button
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                        className="text-xs text-teal-700 hover:underline"
                      >
                        {expandedId === p.id ? 'Masquer' : 'Voir le dossier'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === p.id && (
                  <tr className="bg-slate-50 border-t border-slate-100">
                    <td colSpan={4} className="px-4 py-3">
                      {p.antecedents_medicaux && (
                        <p className="text-xs text-slate-600 mb-1">
                          <span className="font-medium">Antecedents :</span> {p.antecedents_medicaux}
                        </p>
                      )}
                      {p.allergies && (
                        <p className="text-xs text-slate-600">
                          <span className="font-medium">Allergies :</span> {p.allergies}
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
