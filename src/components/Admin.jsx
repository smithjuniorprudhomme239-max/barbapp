import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Admin.css'

export default function Admin({ onLogout }) {
  const { adminLogout } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    fetch('http://100.111.241.53:5000/api/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { setBookings(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleLogout = () => { adminLogout(); onLogout() }

  const today = bookings.filter(b => new Date(b.date).toDateString() === new Date().toDateString()).length
  const services = [...new Set(bookings.map(b => b.service))].length

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">✂ FadeKing</div>
        <nav className="sidebar-nav">
          <span className="sidebar-link active">📋 Bookings</span>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>⬅ Logout</button>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1>Dashboard</h1>
          <span className="admin-badge">👤 admin</span>
        </div>

        {/* Stat Cards */}
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div>
              <p className="stat-value">{bookings.length}</p>
              <p className="stat-label">Total Bookings</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🕐</span>
            <div>
              <p className="stat-value">{today}</p>
              <p className="stat-label">Today's Bookings</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✂</span>
            <div>
              <p className="stat-value">{services}</p>
              <p className="stat-label">Services Booked</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          <h2>All Bookings</h2>
          {loading ? (
            <p className="no-bookings">Loading...</p>
          ) : bookings.length === 0 ? (
            <p className="no-bookings">No bookings yet.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Service</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b.id}>
                      <td>{i + 1}</td>
                      <td>{b.name}</td>
                      <td>{b.phone}</td>
                      <td>{b.email || '—'}</td>
                      <td><span className="service-tag">{b.service}</span></td>
                      <td>{new Date(b.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
