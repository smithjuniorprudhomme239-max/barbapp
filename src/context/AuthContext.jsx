import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()
const API = 'http://100.111.241.53:5000/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    return t && u ? JSON.parse(u) : null
  })
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken') || null)

  const signup = async (name, email, password) => {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, msg: data.error }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return { ok: true }
  }

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, msg: data.error }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return { ok: true }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const adminLogin = async (username, password) => {
    const res = await fetch(`${API}/auth/admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (!res.ok) return false
    localStorage.setItem('adminToken', data.token)
    setAdminToken(data.token)
    return true
  }

  const adminLogout = () => {
    localStorage.removeItem('adminToken')
    setAdminToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, adminToken, login, signup, logout, adminLogin, adminLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
