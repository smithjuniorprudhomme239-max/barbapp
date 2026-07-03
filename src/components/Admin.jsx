import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import './Admin.css'

export default function Admin({ onLogout }) {
  const { adminLogout } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const bostonTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(now)

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: true })
      if (error) throw error
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleLogout = async () => {
    await adminLogout()
    onLogout()
  }

  const toggleStatus = async (booking) => {
    const newStatus = booking.status === 'completed' ? 'pending' : 'completed'
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', booking.id)
    if (error) {
      console.error('Error updating status:', error)
      return
    }
    setBookings(prev =>
      prev.map(b => b.id === booking.id ? { ...b, status: newStatus } : b)
    )
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', deleteId)
    if (error) {
      console.error('Error deleting:', error)
      setDeleting(false)
      setDeleteId(null)
      return
    }
    setBookings(prev => prev.filter(b => b.id !== deleteId))
    setDeleting(false)
    setDeleteId(null)
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return bookings
    const q = search.toLowerCase()
    return bookings.filter(b =>
      b.name?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q) ||
      b.service?.toLowerCase().includes(q)
    )
  }, [bookings, search])

  const today = bookings.filter(b => new Date(b.date).toDateString() === new Date().toDateString()).length
  const pendingCount = bookings.filter(b => b.status === 'pending' || !b.status).length

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">✂ Duckens</div>
        <nav className="sidebar-nav">
          <span className="sidebar-link active">📋 Bookings</span>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>⬅ Logout</button>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1>Dashboard</h1>
            <span className="topbar-clock">{bostonTime}</span>
          </div>
          <span className="admin-badge">👤 admin</span>
        </div>

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
              <p className="stat-label">Today</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⏳</span>
            <div>
              <p className="stat-value">{pendingCount}</p>
              <p className="stat-label">Pending</p>
            </div>
          </div>
        </div>

        <div className="admin-table-wrap">
          <div className="table-header">
            <h2>All Bookings</h2>
            <input
              className="search-input"
              type="text"
              placeholder="🔍 Search bookings..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="no-bookings">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="no-bookings">{search ? 'No matching bookings.' : 'No bookings yet.'}</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, i) => (
                    <tr key={b.id} className={b.status === 'completed' ? 'row-completed' : ''}>
                      <td>{i + 1}</td>
                      <td className="td-name">{b.name}</td>
                      <td>{b.phone || '—'}</td>
                      <td><span className="service-tag">{b.service}</span></td>
                      <td>{formatDate(b.date)}</td>
                      <td>{formatTime(b.date)}</td>
                      <td>
                        <button
                          className={`status-btn ${b.status === 'completed' ? 'status-done' : 'status-pend'}`}
                          onClick={() => toggleStatus(b)}
                        >
                          {b.status === 'completed' ? 'Done' : 'Pending'}
                        </button>
                      </td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => setDeleteId(b.id)}
                          title="Delete booking"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Delete Booking?</h3>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}