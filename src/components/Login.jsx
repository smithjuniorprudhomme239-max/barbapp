import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login({ onSuccess, onClose }) {
  const { adminLogin, forgotPassword } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [success, setSuccess] = useState('')

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const ok = await adminLogin(form.email, form.password)
    if (ok) {
      setSuccess('Login successful!')
      setTimeout(() => onSuccess(), 1000)
    } else {
      setError('Invalid email or password.')
    }
  }

  const handleForgotPassword = async e => {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess(false)
    
    const res = await forgotPassword(forgotEmail)
    if (res.ok) {
      setForgotSuccess(true)
      setForgotEmail('')
    } else {
      setForgotError(res.msg)
    }
  }

  return (
    <div className="login-page">
      {!showForgotPassword ? (
        <form className="login-form" onSubmit={submit}>
          <button type="button" className="close-btn" onClick={onClose}>✕</button>
          <h2>Admin Login</h2>
          <input name="email" placeholder="Email" value={form.email} onChange={handle} required />
          <div className="password-input-container">
            <input 
              name="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={form.password} 
              onChange={handle} 
              required 
            />
            <button 
              type="button" 
              className="password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {error && <p className="login-error">{error}</p>}
          {success && <p className="login-success">{success}</p>}
        <button type="submit">Login</button>
          <p className="forgot-password">
            <span onClick={() => setShowForgotPassword(true)}>Forgot Password?</span>
          </p>
        </form>
      ) : (
        <form className="login-form" onSubmit={handleForgotPassword}>
          <button type="button" className="close-btn" onClick={() => setShowForgotPassword(false)}>✕</button>
          <h2>Forgot Password</h2>
          <p className="forgot-password-info">Enter your email address and we'll send you a link to reset your password.</p>
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={forgotEmail} 
            onChange={(e) => setForgotEmail(e.target.value)} 
            required 
          />
          {forgotError && <p className="login-error">{forgotError}</p>}
          {forgotSuccess && <p className="login-success">Password reset email sent! Check your inbox.</p>}
          <button type="submit">Send Reset Link</button>
          <p className="back-to-login">
            <span onClick={() => setShowForgotPassword(false)}>Back to Login</span>
          </p>
        </form>
      )}
    </div>
  )
}