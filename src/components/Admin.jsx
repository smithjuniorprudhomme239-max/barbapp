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
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const [activeTab, setActiveTab] = useState('bookings')
  const [daysOff, setDaysOff] = useState([])
  const [dayOffDate, setDayOffDate] = useState('')
  const [addingDayOff, setAddingDayOff] = useState(false)
  const [dayOffError, setDayOffError] = useState('')

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

  const fetchDaysOff = async () => {
    try {
      const { data, error } = await supabase
        .from('days_off')
        .select('*')
        .order('date', { ascending: true })
      if (error) throw error
      setDaysOff(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching days off:', error)
    }
  }

  useEffect(() => {
    fetchBookings()
    fetchDaysOff()
  }, [])

  useEffect(() => {
    if (!statusMenuId) return
    const close = (e) => {
      if (!e.target.closest('.status-menu') && !e.target.closest('.status-btn')) {
        setStatusMenuId(null)
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [statusMenuId])

  const handleBack = () => {
    onLogout()
  }

  const changeStatus = async (booking, newStatus) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', booking.id)
    if (error) {
      console.error('Error updating status:', error)
      return
    }
    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: newStatus } : b))
    setStatusMenuId(null)
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

  const handleAddDayOff = async () => {
    if (!dayOffDate) {
      setDayOffError('Please select a date.')
      return
    }
    setDayOffError('')
    setAddingDayOff(true)
    try {
      const { data: existing } = await supabase
        .from('days_off')
        .select('id')
        .eq('date', dayOffDate)
        .limit(1)
      if (existing && existing.length > 0) {
        setDayOffError('This date is already marked as day off.')
        setAddingDayOff(false)
        return
      }
      const { data, error } = await supabase
        .from('days_off')
        .insert([{ date: dayOffDate }])
        .select()
      if (error) throw error
      if (data) {
        setDaysOff(prev => [...prev, ...data].sort((a, b) => a.date.localeCompare(b.date)))
      }
      setDayOffDate('')
    } catch (error) {
      console.error('Error adding day off:', error)
      setDayOffError('Failed to add day off.')
    } finally {
      setAddingDayOff(false)
    }
  }

  const handleRemoveDayOff = async (id) => {
    const { error } = await supabase
      .from('days_off')
      .delete()
      .eq('id', id)
    if (error) {
      console.error('Error removing day off:', error)
      return
    }
    setDaysOff(prev => prev.filter(d => d.id !== id))
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

  const formatDayOffDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">✂ Duckens</div>
        <nav className="sidebar-nav">
          <span
            className={`sidebar-link ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >📋 Bookings</span>
          <span
            className={`sidebar-link ${activeTab === 'daysOff' ? 'active' : ''}`}
            onClick={() => setActiveTab('daysOff')}
          >🏖 Days Off</span>
        </nav>
        <button className="sidebar-logout" onClick={handleBack}>← Back</button>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1>{activeTab === 'daysOff' ? 'Days Off' : 'Dashboard'}</h1>
            <span className="topbar-clock">{bostonTime}</span>
          </div>
          <span className="admin-badge">👤 admin</span>
        </div>

        {activeTab === 'bookings' ? (
          <>
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
                          <td><a href={`tel:${b.phone}`} className="phone-link" title={`Call ${b.phone}`}><span className="phone-icon">📞</span> {b.phone}</a></td>
                          <td><span className="service-tag">{b.service}</span></td>
                          <td>{formatDate(b.date)}</td>
                          <td>{formatTime(b.date)}</td>
                          <td style={{ position: 'relative', overflow: 'visible' }}>
                            <button
                              className={`status-btn ${b.status === 'completed' ? 'status-done' : 'status-pend'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                const rect = e.currentTarget.getBoundingClientRect()
                                const menuWidth = 150
                                const left = rect.left + menuWidth > window.innerWidth
                                  ? window.innerWidth - menuWidth - 8
                                  : rect.left
                                setMenuPos({ top: rect.bottom + 4, left })
                                setStatusMenuId(statusMenuId === b.id ? null : b.id)
                              }}
                            >
                              {b.status === 'completed' ? 'Done ▾' : 'Pending ▾'}
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
          </>
        ) : (
          <div className="admin-table-wrap">
            <div className="table-header">
              <h2>Manage Days Off</h2>
            </div>

            <div className="dayoff-add">
              <div className="dayoff-input-group">
                <input
                  type="date"
                  className="dayoff-date-input"
                  value={dayOffDate}
                  min={bostonTodayStr}
                  onChange={e => { setDayOffDate(e.target.value); setDayOffError('') }}
                />
                <button
                  className="dayoff-add-btn"
                  onClick={handleAddDayOff}
                  disabled={addingDayOff || !dayOffDate}
                >
                  {addingDayOff ? 'Adding...' : '+ Add Day Off'}
                </button>
              </div>
              {dayOffError && <p className="dayoff-error">{dayOffError}</p>}
            </div>

            {daysOff.length === 0 ? (
              <p className="no-bookings">No days off scheduled.</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daysOff.map((d, i) => (
                      <tr key={d.id}>
                        <td>{i + 1}</td>
                        <td className="td-name">{d.date}</td>
                        <td>{formatDayOffDate(d.date)}</td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleRemoveDayOff(d.id)}
                            title="Remove day off"
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
        )}
      </main>

      {statusMenuId && (() => {
        const booking = filtered.find(b => b.id === statusMenuId)
        if (!booking) return null
        return (
          <div className="status-menu" style={{ top: menuPos.top, left: menuPos.left }}>
            <button className="status-menu-item status-opt-pending" onMouseDown={(e) => { e.stopPropagation(); changeStatus(booking, 'pending') }}>⏳ Pending</button>
            <button className="status-menu-item status-opt-done" onMouseDown={(e) => { e.stopPropagation(); changeStatus(booking, 'completed') }}>✅ Completed</button>
          </div>
        )
      })()}

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