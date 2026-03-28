import { useEffect, useState } from 'react'
import { useAuth, supabase } from '../context/AuthContext'
import './Admin.css'

export default function Admin({ onLogout }) {
  const { adminLogout, user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = async () => {
    console.log('Fetching bookings...')
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) {
      console.error('Error fetching bookings:', error)
      setLoading(false)
    } else {
      console.log('Bookings fetched:', data)
      setBookings(Array.isArray(data) ? data : [])
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const toggleBookingStatus = async (bookingId, currentStatus) => {
    console.log('Toggling booking status:', bookingId, 'Current status:', currentStatus, 'New status:', !currentStatus)
    const { error } = await supabase
      .from('bookings')
      .update({ status: !currentStatus })
      .eq('id', bookingId)
    
    if (error) {
      console.error('Error updating booking status:', error)
    } else {
      console.log('Booking status updated successfully')
      // Refresh bookings after update
      fetchBookings()
    }
  }

  const handleLogout = async () => { 
    await adminLogout()
    onLogout() 
  }

  const today = bookings.filter(b => new Date(b.date).toDateString() === new Date().toDateString()).length
  const services = [...new Set(bookings.map(b => b.service))].length

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">✂ DuckensBarber</div>
        <nav className="sidebar-nav">
          <span className="sidebar-link active">📋 Bookings</span>
        </nav>
        <button className="sidebar-logout" onClick={handleLogout} style={{ color: '#cc0000' }}>⬅ Logout</button>
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
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b.id} className={b.status ? 'completed-booking' : 'pending-booking'}>
                      <td>{i + 1}</td>
                      <td>{b.name}</td>
                      <td>{b.phone}</td>
                      <td>{b.email || '—'}</td>
                      <td><span className="service-tag">{b.service}</span></td>
                      <td>{new Date(b.date).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${b.status ? 'status-completed' : 'status-pending'}`}>
                          {b.status ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`status-toggle ${b.status ? 'toggle-completed' : 'toggle-pending'}`}
                          onClick={() => toggleBookingStatus(b.id, b.status)}
                        >
                          {b.status ? 'Mark as Pending' : 'Mark as Completed'}
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
    </div>
  )
}