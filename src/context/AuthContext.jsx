import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

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

    return true
  }

  const adminLogout = async () => {
    await supabase.auth.signOut()
  }

  const forgotPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) return { ok: false, msg: error.message }
    return { ok: true, msg: 'Check your email for reset link' }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, adminLogin, adminLogout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)