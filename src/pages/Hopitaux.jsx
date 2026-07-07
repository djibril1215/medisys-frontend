import { useEffect, useState } from 'react'
import { Plus, Building2, ArrowRight, CheckCircle2, Clock3, Share2 } from 'lucide-react'
import { hopitauxApi, patientsApi } from '../services/api'

function Badge({ statut }) {
  const isAccepte = statut === 'accepte'
  const tone = isAccepte
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-amber-50 text-amber-700 border-amber-200'
  const Icon = isAccepte ? CheckCircle2 : Clock3
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${tone}`}>
      <Icon size={11} /> {isAccepte ? 'Accepte' : 'En attente'}
    </span>
  )
}

export default function Hopitaux() {
  const [hopitaux, setHopitaux] = useState([])
  const [transferts, setTransferts] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showHopitalForm, setShowHopitalForm] = useState(false)
  const [hopitalForm, setHopitalForm] = useState({ nom: '', ville: '', specialites: '', capacite_lits: '' })
  const [savingHopital, setSavingHopital] = useState(false)

  const [showTransfertForm, setShowTransfertForm] = useState(false)
  const [transfertForm, setTransfertForm] = useState({
    patient_id: '', hopital_source_id: '', hopital_destination_id: '', motif: '',
  })
  const [savingTransfert, setSavingTransfert] = useState(false)

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      hopitauxApi.get('/hopitaux'),
      hopitauxApi.get('/hopitaux/transferts/all'),
      patientsApi.get('/patients'),
    ])
      .then(([h, t, p]) => {
        setHopitaux(h.data.hopitaux)
        setTransferts(t.data.transferts)
        setPatients(p.data.patients)
      })
      .catch(() => setError('Impossible de charger les donnees.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
  }, [])

  const nomHopital = (id) => hopitaux.find((h) => h.id === id)?.nom || `#${id}`
  const nomPatient = (id) => {
    const p = patients.find((x) => x.id === id)
    return p ? `${p.prenom} ${p.nom}` : `#${id}`
  }

  const handleHopitalSubmit = async (e) => {
    e.preventDefault()
    setSavingHopital(true)
    try {
      await hopitauxApi.post('/hopitaux', hopitalForm)
      setHopitalForm({ nom: '', ville: '', specialites: '', capacite_lits: '' })
      setShowHopitalForm(false)
      loadAll()
    } catch {
      setError("Impossible de creer l'hopital.")
    } finally {
      setSavingHopital(false)
    }
  }

  const handleTransfertSubmit = async (e) => {
    e.preventDefault()
    setSavingTransfert(true)
    try {
      await hopitauxApi.post('/hopitaux/transferts', transfertForm)
      setTransfertForm({ patient_id: '', hopital_source_id: '', hopital_destination_id: '', motif: '' })
      setShowTransfertForm(false)
      loadAll()
    } catch {
      setError('Impossible de creer le transfert.')
    } finally {
      setSavingTransfert(false)
    }
  }

  const handleValider = async (id) => {
    try {
      await hopitauxApi.patch(`/hopitaux/transferts/${id}/valider`)
      loadAll()
    } catch {
      setError('Impossible de valider le transfert.')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Hopitaux</h1>
        <p className="text-sm text-slate-500">Reseau d'etablissements et transferts de patients.</p>
      </div>

      {loading && <p className="text-sm text-slate-400 mb-4">Chargement...</p>}
      {error && <p className="text-sm text-rose-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Colonne hopitaux */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Etablissements</h2>
            <button
              onClick={() => setShowHopitalForm(!showHopitalForm)}
              className="text-xs text-teal-700 hover:underline flex items-center gap-1"
            >
              <Plus size={12} /> Ajouter
            </button>
          </div>

          {showHopitalForm && (
            <form
              onSubmit={handleHopitalSubmit}
              className="bg-white border border-slate-200 rounded-xl p-3 mb-3 flex flex-col gap-2"
            >
              <input
                required placeholder="Nom" value={hopitalForm.nom}
                onChange={(e) => setHopitalForm({ ...hopitalForm, nom: e.target.value })}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
              />
              <input
                placeholder="Ville" value={hopitalForm.ville}
                onChange={(e) => setHopitalForm({ ...hopitalForm, ville: e.target.value })}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
              />
              <input
                placeholder="Specialites" value={hopitalForm.specialites}
                onChange={(e) => setHopitalForm({ ...hopitalForm, specialites: e.target.value })}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
              />
              <input
                type="number" placeholder="Capacite (lits)" value={hopitalForm.capacite_lits}
                onChange={(e) => setHopitalForm({ ...hopitalForm, capacite_lits: e.target.value })}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
              />
              <button
                type="submit" disabled={savingHopital}
                className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-60"
              >
                {savingHopital ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
          )}

          <div className="flex flex-col gap-2">
            {hopitaux.map((h) => (
              <div key={h.id} className="bg-white border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={14} className="text-teal-700" />
                  <span className="text-sm font-medium text-slate-800">{h.nom}</span>
                </div>
                <p className="text-xs text-slate-500">{h.ville}</p>
                {h.specialites && <p className="text-xs text-slate-400 mt-1">{h.specialites}</p>}
                {h.capacite_lits && (
                  <p className="text-xs text-slate-400 mt-1">{h.capacite_lits} lits</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Colonne transferts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Share2 size={14} className="text-slate-400" /> Transferts inter-hopitaux
            </h2>
            <button
              onClick={() => setShowTransfertForm(!showTransfertForm)}
              className="bg-teal-950 hover:bg-teal-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Plus size={12} /> Nouveau transfert
            </button>
          </div>

          {showTransfertForm && (
            <form
              onSubmit={handleTransfertSubmit}
              className="bg-white border border-slate-200 rounded-xl p-4 mb-4 grid grid-cols-2 gap-3"
            >
              <select
                required value={transfertForm.patient_id}
                onChange={(e) => setTransfertForm({ ...transfertForm, patient_id: e.target.value })}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 col-span-2"
              >
                <option value="">Selectionner un patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                ))}
              </select>

              <select
                required value={transfertForm.hopital_source_id}
                onChange={(e) => setTransfertForm({ ...transfertForm, hopital_source_id: e.target.value })}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
              >
                <option value="">Hopital source</option>
                {hopitaux.map((h) => (
                  <option key={h.id} value={h.id}>{h.nom}</option>
                ))}
              </select>

              <select
                required value={transfertForm.hopital_destination_id}
                onChange={(e) => setTransfertForm({ ...transfertForm, hopital_destination_id: e.target.value })}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600"
              >
                <option value="">Hopital destination</option>
                {hopitaux.map((h) => (
                  <option key={h.id} value={h.id}>{h.nom}</option>
                ))}
              </select>

              <input
                placeholder="Motif du transfert" value={transfertForm.motif}
                onChange={(e) => setTransfertForm({ ...transfertForm, motif: e.target.value })}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 col-span-2"
              />

              <button
                type="submit" disabled={savingTransfert}
                className="col-span-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-60"
              >
                {savingTransfert ? 'Enregistrement...' : 'Creer le transfert'}
              </button>
            </form>
          )}

          <div className="flex flex-col gap-3">
            {transferts.map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-800">{nomPatient(t.patient_id)}</p>
                  <Badge statut={t.statut} />
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-2">
                  {nomHopital(t.hopital_source_id)}
                  <ArrowRight size={11} className="text-slate-400" />
                  {nomHopital(t.hopital_destination_id)}
                </p>
                {t.motif && <p className="text-xs text-slate-400 mb-2">{t.motif}</p>}
                {t.statut !== 'accepte' && (
                  <button
                    onClick={() => handleValider(t.id)}
                    className="text-xs text-teal-700 hover:underline font-medium"
                  >
                    Valider le transfert
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
