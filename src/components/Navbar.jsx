import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const links = ['Services', 'Gallery', 'About', 'Contact']

export default function Navbar({ onAdminClick, onUserAuthClick, onMarketClick }) {
  const [open, setOpen] = useState(false)
  const { user, isAdmin, logout } = useAuth()

  return (
    <nav className="navbar">
      <a href="#hero" className="brand">✂ DuckensBarber</a>
      <button className="burger" onClick={() => setOpen(!open)}>☰</button>
      <ul className={open ? 'nav-links open' : 'nav-links'}>
        {links.map(l => (
          <li key={l}><a href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}>{l}</a></li>
        ))}
        <li><a href="#contact" className="btn-book" onClick={() => setOpen(false)}>Book Now</a></li>
        <li><button className="btn-book" onClick={() => { setOpen(false); onMarketClick(); }}>Market</button></li>
        {user
          ? (
            <>
              {isAdmin && (
                <li key="dashboard">
                  <button className="btn-admin btn-dashboard" onClick={() => { setOpen(false); onAdminClick(); }}>
                    Dashboard
                  </button>
                </li>
              )}
              <li key="logout">
                <button className="btn-admin" onClick={logout} style={{ color: '#cc0000' }}>
                  Logout
                </button>
              </li>
            </>
          )
          : (
            <li>
              <button className="btn-admin" onClick={onUserAuthClick}>Login / Sign Up</button>
            </li>
          )
        }
      </ul>
    </nav>
  )
}