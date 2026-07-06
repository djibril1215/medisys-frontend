import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Plus, Share2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, motDePasse)
      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Connexion impossible. Verifiez vos identifiants.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-teal-950 flex items-center justify-center">
            <Share2 size={16} className="text-teal-300" />
          </div>
          <span className="font-semibold tracking-tight text-lg text-slate-900">MediSys</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                <Plus size={26} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-4xl font-bold tracking-tight text-blue-600">MediSys</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">
              Bienvenue dans le reseau hospitalier du Cameroun
            </h1>
            <p className="text-sm text-slate-500">Veuillez vous authentifier pour continuer.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-8">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Connexion</h2>
            <p className="text-sm text-slate-500 mb-6">Accedez a votre espace MediSys.</p>

            <form onSubmit={handleSubmit}>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                Email professionnel
              </label>
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2.5 mb-4 focus-within:border-teal-600">
                <Mail size={16} className="text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="j.dupont@medisys.com"
                  className="text-sm w-full outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                Mot de passe
              </label>
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2.5 mb-6 focus-within:border-teal-600">
                <Lock size={16} className="text-slate-400" />
                <input
                  type="password"
                  required
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••••"
                  className="text-sm w-full outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {error && <p className="text-sm text-rose-600 mb-4">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {loading ? 'Connexion...' : 'Se connecter'} <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-xs text-slate-400">
          <span>© 2026 MediSys</span>
          <span>Plateforme de gestion hospitaliere</span>
        </div>
      </footer>
    </div>
  )
}
