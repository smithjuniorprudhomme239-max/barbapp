import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const links = ['Services', 'Gallery', 'About', 'Contact']

export default function Navbar({ onAdminClick, onUserAuthClick }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <a href="#hero" className="brand">✂ DuckensBarber</a>
      <button className="burger" onClick={() => setOpen(!open)}>☰</button>
      <ul className={open ? 'nav-links open' : 'nav-links'}>
        {links.map(l => (
          <li key={l}><a href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}>{l}</a></li>
        ))}
        <li><a href="#contact" className="btn-book" onClick={() => setOpen(false)}>Book Now</a></li>
        <li>
          {user
            ? <button className="btn-admin" onClick={logout}>👤 {user.name} · Logout</button>
            : <button className="btn-admin" onClick={onUserAuthClick}>Login / Sign Up</button>
          }
        </li>
        <li><button className="btn-admin" onClick={onAdminClick}>Admin</button></li>
      </ul>
    </nav>
  )
}
