import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import './Admin.css'

const BOSTON_TZ = 'America/New_York'

export default function Admin({ onLogout }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [now, setNow] = useState(new Date())
  const [filterToday, setFilterToday] = useState(false)
  const [filterPending, setFilterPending] = useState(false)
  const [statusMenuId, setStatusMenuId] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const bostonTime = new Intl.DateTimeFormat('en-US', {
    timeZone: BOSTON_TZ,
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

  const handleBack = () => {
    onLogout()
  }

  const changeStatus = async (booking, newStatus) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token
    if (!token) { alert('Not authenticated. Please log in again.'); return }

    try {
      const res = await fetch('http://localhost:5000/api/bookings/' + booking.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) {
        const data = await res.json()
        alert('Failed to update: ' + (data.error || res.statusText))
        return
      }
      setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: newStatus } : b))
      setStatusMenuId(null)
    } catch (err) {
      alert('Network error. Is the server running? ' + err.message)
    }
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

  const bostonTodayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: BOSTON_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date())

  const filtered = useMemo(() => {
    let list = filterToday
      ? bookings.filter(b => (b.date || '').split('T')[0] === bostonTodayStr)
      : bookings
    if (filterPending) {
      list = list.filter(b => b.status === 'pending' || !b.status)
    }
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(b =>
      b.name?.toLowerCase().includes(q) ||
      b.service?.toLowerCase().includes(q)
    )
  }, [bookings, search, filterToday, filterPending, bostonTodayStr])

  const today = bookings.filter(b => {
    const [datePart] = (b.date || '').split('T')
    return datePart === bostonTodayStr
  }).length
  const pendingCount = bookings.filter(b => b.status === 'pending' || !b.status).length

  const formatDate = (dateStr) => {
    const [datePart] = (dateStr || '').split('T')
    const [y, m, d] = datePart.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateStr) => {
    const [, timePart] = (dateStr || '').split('T')
    const cleanTime = (timePart || '').replace(/[+-]\d{2}:\d{2}$/, '')
    const [h, min] = (cleanTime || '0:0').split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${displayHour}:${String(min).padStart(2, '0')} ${period}`
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">✂ Duckens</div>
        <nav className="sidebar-nav">
          <span className="sidebar-link active">📋 Bookings</span>
        </nav>
        <button className="sidebar-logout" onClick={handleBack}>← Back</button>
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
          <div className="stat-card" onClick={() => { setFilterToday(false); setFilterPending(false) }} style={{ cursor: 'pointer' }}>
            <span className="stat-icon">📅</span>
            <div>
              <p className="stat-value">{bookings.length}</p>
              <p className="stat-label">Total Bookings</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => { setFilterToday(f => !f); setFilterPending(false) }} style={{ cursor: 'pointer', outline: filterToday && !filterPending ? '2px solid #2e7d32' : 'none' }}>
            <span className="stat-icon">🕐</span>
            <div>
              <p className="stat-value">{today}</p>
              <p className="stat-label">{filterToday && !filterPending ? 'Today ✕' : 'Today'}</p>
            </div>
          </div>
          <div className="stat-card" onClick={() => setFilterPending(f => !f)} style={{ cursor: 'pointer', outline: filterPending ? '2px solid #e65100' : 'none' }}>
            <span className="stat-icon">⏳</span>
            <div>
              <p className="stat-value">{pendingCount}</p>
              <p className="stat-label">{filterPending ? 'Pending ✕' : 'Pending'}</p>
            </div>
          </div>
        </div>

        <div className="admin-table-wrap">
          <div className="table-header">
            <h2>{filterToday ? "Today's Bookings" : 'All Bookings'}</h2>
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
                      <td>{b.phone}</td>
                      <td><span className="service-tag">{b.service}</span></td>
                      <td>{formatDate(b.date)}</td>
                      <td>{formatTime(b.date)}</td>
                      <td style={{ position: 'relative' }}>
                        <button
                          className={`status-btn ${b.status === 'completed' ? 'status-done' : 'status-pend'}`}
                          onClick={() => setStatusMenuId(statusMenuId === b.id ? null : b.id)}
                        >
                          {b.status === 'completed' ? 'Done ▾' : 'Pending ▾'}
                        </button>
                        {statusMenuId === b.id && (
                          <div className="status-menu">
                            <button className="status-menu-item status-opt-pending" onClick={() => changeStatus(b, 'pending')}>⏳ Pending</button>
                            <button className="status-menu-item status-opt-done" onClick={() => changeStatus(b, 'completed')}>✅ Completed</button>
                          </div>
                        )}
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