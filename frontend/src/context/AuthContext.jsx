import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('bhumi_user')
    const token  = localStorage.getItem('bhumi_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('bhumi_token', data.token)
    localStorage.setItem('bhumi_user',  JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('bhumi_token')
    localStorage.removeItem('bhumi_user')
    setUser(null)
    toast.success('Logout ho gaye')
  }

  const isAdmin   = user?.role === 'admin'
  const isOfficer = user?.role === 'officer'
  const isPublic  = user?.role === 'public'
  const isStaff   = isAdmin || isOfficer

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isOfficer, isPublic, isStaff }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
