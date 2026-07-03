import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAdmin = async (userId) => {
    if (!userId) {
      setIsAdmin(false)
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    setIsAdmin(profile?.role === 'admin')
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) checkAdmin(currentUser.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) checkAdmin(currentUser.id)
      else setIsAdmin(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user !== undefined) setLoading(false)
  }, [user])

  const signup = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) return { ok: false, msg: error.message }
    return { ok: true, user: data.user }
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, msg: error.message }
    return { ok: true, user: data.user }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
    return { ok: true }
  }

  const adminLogin = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return false

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      return false
    }

    setIsAdmin(true)
    return true
  }

  const adminLogout = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
  }

  const forgotPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) return { ok: false, msg: error.message }
    return { ok: true, msg: 'Check your email for reset link' }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, signup, logout, adminLogin, adminLogout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)