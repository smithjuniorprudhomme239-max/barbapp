import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login({ onSuccess }) {
  const { adminLogin } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = e => {
    e.preventDefault()
    const ok = adminLogin(form.username, form.password)
    if (ok) onSuccess()
    else setError('Invalid username or password.')
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={submit}>
        <h2>Admin Login</h2>
        <input name="username" placeholder="Username" value={form.username} onChange={handle} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle} required />
        {error && <p className="login-error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
