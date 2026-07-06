import { createContext, useContext, useState } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('medisys_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email, mot_de_passe) => {
    const { data } = await authApi.post('/auth/login', { email, mot_de_passe })
    localStorage.setItem('medisys_token', data.token)
    localStorage.setItem('medisys_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('medisys_token')
    localStorage.removeItem('medisys_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
