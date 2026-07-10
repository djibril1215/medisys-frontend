import { useEffect, useState } from 'react'
import { Plus, Building2, ArrowRight, CheckCircle2, Clock3, Share2, Trash2, History } from 'lucide-react'
import { hopitauxApi, patientsApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Badge({ statut, modeReprise }) {
  const isAccepte = statut === 'accepte'
  const tone = isAccepte
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-amber-50 text-amber-700 border-amber-200'
  const Icon = isAccepte ? CheckCircle2 : Clock3
  let label = isAccepte ? 'Accepte' : 'En attente'
  if (isAccepte && modeReprise) {
    label = modeReprise === 'continuer' ? 'Accepte - Traitement poursuivi' : 'Accepte - Nouveau dossier'
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${tone}`}>
      <Icon size={11} /> {label}
    </span>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function Hopitaux() {
  const { user } = useAuth()
  const estSuperAdmin = user?.role === 'super_admin'
  const estMedecin = user?.role === 'medecin'

  const [hopitaux, setHopitaux] = useState([])
  const [transferts, setTransferts] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const [showHopitalForm, setShowHopitalForm] = useState(false)
  const [hopitalForm, setHopitalForm] = useState({ nom: '', ville: '', specialites: '', capacite_lits: '' })
  const [savingHopital, setSavingHopital] = useState(false)

  const [showTransfertForm, setShowTransfertForm] = useState(false)
  const [transfertForm, setTransfertForm] = useState({ patient_id: '', hopital_destination_id: '', motif: '' })
  const [savingTransfert, setSavingTransfert] = useState(false)

  const [transfertEnValidation, setTransfertEnValidation] = useState(null)
  const [filtreStatut, setFiltreStatut] = useState('tous')

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      hopitauxApi.get('/hopitaux'),
      hopitauxApi.get('/hopitaux/transferts/all'),
      estMedecin ? patientsApi.get('/patients') : Promise.resolve({ data: { patients: [] } }),
    ])
      .then(([h, t, p]) => {
        setHopitaux(h.data.hopitaux)
        setTransferts(
          t.data.transferts.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        )
        setPatients(p.data.patients)
      })
      .catch(() => setError('Impossible de charger les donnees.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const nomHopital = (id) => hopitaux.find((h) => h.id === id)?.nom || `#${id}`

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

  const handleDeleteHopital = async (id, nom) => {
    if (!window.confirm(`Supprimer definitivement l'hopital ${nom} ?`)) return
    setDeletingId(id)
    setError('')
    try {
      await hopitauxApi.delete(`/hopitaux/${id}`)
      loadAll()
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de supprimer cet hopital.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleTransfertSubmit = async (e) => {
    e.preventDefault()
    setSavingTransfert(true)
    try {
      await hopitauxApi.post('/hopitaux/transferts', transfertForm)
      setTransfertForm({ patient_id: '', hopital_destination_id: '', motif: '' })
      setShowTransfertForm(false)
      loadAll()
    } catch {
      setError('Impossible de creer le transfert.')
    } finally {
      setSavingTransfert(false)
    }
  }

  const handleValider = async (id, mode_reprise) => {
    try {
      await hopitauxApi.patch(`/hopitaux/transferts/${id}/valider`, { mode_reprise })
      setTransfertEnValidation(null)
      loadAll()
    } catch {
      setError('Impossible de valider le transfert.')
    }
  }

  const transfertsFiltres = transferts.filter((t) => {
    if (filtreStatut === 'tous') return true
    if (filtreStatut === 'attente') return t.statut !== 'accepte'
    return t.statut === 'accepte'
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Hopitaux</h1>
        <p className="text-sm text-slate-500">Reseau d'etablissements et transferts de patients.</p>
      </div>

      {loading && <p className="text-sm text-slate-400 mb-4">Chargement...</p>}
      {error && <p className="text-sm text-rose-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Etablissements</h2>
            {estSuperAdmin && (
              <button
                onClick={() => setShowHopitalForm(!showHopitalForm)}
                className="text-xs text-teal-700 hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Ajouter
              </button>
            )}
          </div>

          {showHopitalForm && estSuperAdmin && (
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
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-teal-700" />
                    <span className="text-sm font-medium text-slate-800">{h.nom}</span>
                  </div>
                  {estSuperAdmin && (
                    <button
                      onClick={() => handleDeleteHopital(h.id, h.nom)}
                      disabled={deletingId === h.id}
                      className="text-rose-600 hover:text-rose-700 disabled:opacity-50"
                      title="Supprimer cet hopital"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500">{h.ville}</p>
                {h.specialites && <p className="text-xs text-slate-400 mt-1">{h.specialites}</p>}
                {h.capacite_lits && <p className="text-xs text-slate-400 mt-1">{h.capacite_lits} lits</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Share2 size={14} className="text-slate-400" /> Transferts inter-hopitaux
            </h2>
            {estMedecin && (
              <button
                onClick={() => setShowTransfertForm(!showTransfertForm)}
                className="bg-teal-950 hover:bg-teal-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Plus size={12} /> Nouveau transfert
              </button>
            )}
          </div>

          {!estMedecin && (
            <p className="text-xs text-slate-400 mb-4">
              Seul un medecin peut initier ou valider un transfert de patient.
            </p>
          )}

          {showTransfertForm && estMedecin && (
            <form
              onSubmit={handleTransfertSubmit}
              className="bg-white border border-slate-200 rounded-xl p-4 mb-4 grid grid-cols-2 gap-3"
            >
              <select
                required value={transfertForm.patient_id}
                onChange={(e) => setTransfertForm({ ...transfertForm, patient_id: e.target.value })}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 col-span-2"
              >
                <option value="">Selectionner un patient de votre etablissement</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                ))}
              </select>

              <select
                required value={transfertForm.hopital_destination_id}
                onChange={(e) => setTransfertForm({ ...transfertForm, hopital_destination_id: e.target.value })}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-teal-600 col-span-2"
              >
                <option value="">Hopital destination</option>
                {hopitaux.filter((h) => h.id !== user?.hopital_id).map((h) => (
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

          <div className="flex gap-1 mb-3 bg-slate-100 rounded-lg p-1 w-fit">
            {[
              { key: 'tous', label: 'Tous' },
              { key: 'attente', label: 'En attente' },
              { key: 'acceptes', label: 'Acceptes' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltreStatut(f.key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                  filtreStatut === f.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {transfertsFiltres.length === 0 && !loading && (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center">
              <History size={20} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Aucun transfert pour ce filtre.</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {transfertsFiltres.map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-800">
                    {t.donnees_patient?.prenom} {t.donnees_patient?.nom}
                  </p>
                  <Badge statut={t.statut} modeReprise={t.mode_reprise} />
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                  {nomHopital(t.hopital_source_id)}
                  <ArrowRight size={11} className="text-slate-400" />
                  {nomHopital(t.hopital_destination_id)}
                </p>
                <p className="text-xs text-slate-400 mb-2">Cree le {formatDate(t.created_at)}</p>
                {t.motif && <p className="text-xs text-slate-500 mb-2 italic">"{t.motif}"</p>}

                {estMedecin && t.statut !== 'accepte' && t.hopital_destination_id === user?.hopital_id && (
                  transfertEnValidation === t.id ? (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleValider(t.id, 'continuer')}
                        className="text-xs bg-teal-950 hover:bg-teal-900 text-white px-3 py-1.5 rounded-lg"
                      >
                        Continuer le traitement
                      </button>
                      <button
                        onClick={() => handleValider(t.id, 'nouveau_dossier')}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg"
                      >
                        Nouveau dossier
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setTransfertEnValidation(t.id)}
                      className="text-xs text-teal-700 hover:underline font-medium"
                    >
                      Valider le transfert
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
