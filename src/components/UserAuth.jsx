import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function UserAuth({ onSuccess, onClose }) {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setError('')
    if (mode === 'login') {
      const res = login(form.email, form.password)
      if (res.ok) onSuccess()
      else setError(res.msg)
    } else {
      const res = signup(form.name, form.email, form.password)
      if (res.ok) onSuccess()
      else setError(res.msg)
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={submit}>
        <button type="button" className="close-btn" onClick={onClose}>✕</button>
        <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>

        {mode === 'signup' && (
          <input name="name" placeholder="Full Name" value={form.name} onChange={handle} required />
        )}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handle} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle} required />

        {error && <p className="login-error">{error}</p>}

        <button type="submit">{mode === 'login' ? 'Login' : 'Sign Up'}</button>

        <p className="auth-toggle">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <span onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>
            {mode === 'login' ? ' Sign Up' : ' Login'}
          </span>
        </p>
      </form>
    </div>
  )
}
