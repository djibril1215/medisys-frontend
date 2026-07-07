import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Stethoscope, CalendarDays, Building2,
  BarChart3, Bell, Share2, ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { hopitauxApi } from '../services/api'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [hopitalNom, setHopitalNom] = useState('')

  useEffect(() => {
    if (user?.hopital_id) {
      hopitauxApi
        .get(`/hopitaux/${user.hopital_id}`)
        .then(({ data }) => setHopitalNom(data.hopital.nom))
        .catch(() => setHopitalNom(''))
    }
  }, [user])

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', end: true, roles: ['super_admin', 'medecin', 'urgentiste', 'infirmier'] },
    { to: '/patients', icon: Users, label: 'Patients', roles: ['medecin', 'urgentiste', 'infirmier'] },
    { to: '/personnel', icon: Stethoscope, label: 'Personnel', roles: ['medecin', 'super_admin'] },
    { to: '/consultations', icon: CalendarDays, label: 'Consultations', roles: ['medecin', 'urgentiste', 'infirmier'] },
    { to: '/hopitaux', icon: Building2, label: 'Hopitaux', roles: ['medecin', 'super_admin'] },
    { to: '/stats', icon: BarChart3, label: 'Statistiques', roles: ['super_admin', 'medecin'] },
    { to: '/admin', icon: ShieldCheck, label: 'Administration', roles: ['super_admin'] },
  ]

  const visibleNavItems = navItems.filter((item) => item.roles.includes(user?.role))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-56 bg-teal-950 text-teal-100 flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="w-7 h-7 rounded-md bg-teal-800 flex items-center justify-center">
            <Share2 size={14} className="text-teal-300" />
          </div>
          <span className="font-semibold tracking-tight text-white">MediSys</span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {visibleNavItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-teal-900 text-white font-medium'
                    : 'text-teal-300 hover:bg-teal-900/50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="text-xs text-teal-400 hover:text-teal-200 text-left px-3 py-2"
        >
          Se deconnecter
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Building2 size={15} className="text-slate-400" />
            <span className="font-medium text-slate-800">
              {user?.role === 'super_admin' ? 'Reseau MediSys' : hopitalNom || 'Chargement...'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={17} className="text-slate-400" />
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-medium">
                {user?.nom?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-slate-800">{user?.nom}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 overflow-auto flex-1">{children}</main>
      </div>
    </div>
  )
}
