import { useState, useEffect } from 'react'
import { useAuth, supabase } from '../context/AuthContext'
import './Contact.css'

export default function Contact() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', date: '', service: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [bookedAppointments, setBookedAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [userAppointments, setUserAppointments] = useState([])
  const [loadingUserAppointments, setLoadingUserAppointments] = useState(false)

  const handle = e => {
    const newForm = { ...form, [e.target.name]: e.target.value }
    setForm(newForm)
    
    // Fetch booked appointments when date changes
    if (e.target.name === 'date' && newForm.date) {
      fetchBookedAppointments(newForm.date)
    }
  }

  const fetchBookedAppointments = async (date) => {
    if (!date) {
      setBookedAppointments([])
      return
    }

    setLoading(true)
    try {
      // Parse the selected date to get start and end of day
      const selectedDate = new Date(date)
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999))

      const { data, error: supabaseError } = await supabase
        .from('bookings')
        .select('*')
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString())
        .order('date', { ascending: true })

      if (supabaseError) {
        console.error('Error fetching booked appointments:', supabaseError)
      } else {
        setBookedAppointments(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching booked appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserAppointments = async () => {
    if (!user) {
      setUserAppointments([])
      return
    }

    setLoadingUserAppointments(true)
    try {
      const { data, error: supabaseError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

      if (supabaseError) {
        console.error('Error fetching user appointments:', supabaseError)
      } else {
        setUserAppointments(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching user appointments:', error)
    } finally {
      setLoadingUserAppointments(false)
    }
  }

  const deleteAppointment = async (appointmentId) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', appointmentId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting appointment:', error)
        setError('Failed to delete appointment.')
      } else {
        // Refresh appointments after deletion
        fetchUserAppointments()
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      setError('Failed to delete appointment.')
    }
  }

  // Fetch user appointments when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchUserAppointments()
    }
  }, [user])

  const submit = async e => {
    e.preventDefault()
    setError('')

    if (!user) return setError('Please login or sign up to book an appointment.')

    const { data, error: supabaseError } = await supabase
      .from('bookings')
      .insert({
        ...form,
        user_id: user.id
      })
      .select()
      .single()

    if (supabaseError) {
      setError(supabaseError.message || 'Booking failed.')
    } else {
      setSent(true)
    }
  }

  return (
    <section id="contact" className="section contact">
      <h2>Book an Appointment</h2>
      <div className="contact-inner">
        <div className="contact-info">
          <p>📞 (555) 123-4567</p>
          <p>✉️ hello@fadeking.com</p>
          <p>🕐 Mon–Sat: 9am – 7pm</p>
          <p>🕐 Sun: 10am – 4pm</p>
        </div>
        <div className="appointments-container">
          <div className="booking-form-column">
            {/* Booking Form */}
            {sent ? (
              <div className="thanks">
                <h3>Thanks, {form.name}! 🎉</h3>
                <p>We'll confirm your appointment shortly.</p>
                <button 
                  className="okay-button"
                  onClick={() => window.location.reload()}
                >
                  Okay
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="booking-form">
                <input name="name" placeholder="Your Name" value={form.name} onChange={handle} required />
                <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handle} required />
                <input name="date" type="datetime-local" value={form.date} onChange={handle} required />
                <select name="service" value={form.service} onChange={handle} required>
                  <option value="">Select a Service</option>
                  <option>Classic Haircut</option>
                  <option>Fade & Taper</option>
                  <option>Beard Trim</option>
                  <option>Hot Towel Shave</option>
                  <option>Hair + Beard Combo</option>
                  <option>Kids Cut</option>
                </select>
                {error && <p style={{ color: '#cc0000', fontSize: '0.85rem' }}>{error}</p>}
                <button type="submit">Book Now</button>
              </form>
            )}
          </div>
          <div className="appointments-section">
            {/* User's Appointments */}
            {user && (
              <div className="user-appointments">
                <h3>Your Appointments</h3>
                {loadingUserAppointments ? (
                  <p>Loading your appointments...</p>
                ) : userAppointments.length === 0 ? (
                  <p>You don't have any appointments yet.</p>
                ) : (
                  <ul className="appointments-list">
                    {userAppointments.map((appointment, index) => (
                      <li key={index} className="appointment-item">
                        <span className="appointment-time">{new Date(appointment.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                        <span className="appointment-service">{appointment.service}</span>
                        <button className={`appointment-status-btn ${appointment.status ? 'status-completed' : 'status-pending'}`}>
                          {appointment.status ? 'Completed' : 'Pending'}
                        </button>
                        <button 
                          className="delete-appointment-btn"
                          onClick={() => deleteAppointment(appointment.id)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Booked Appointments for Selected Date */}
            {form.date && (
              <div className="booked-appointments">
                <h3>Booked Appointments for {new Date(form.date).toLocaleDateString()}</h3>
                {loading ? (
                  <p>Loading booked appointments...</p>
                ) : bookedAppointments.length === 0 ? (
                  <p>No appointments booked yet for this date.</p>
                ) : (
                  <ul className="appointments-list">
                    {bookedAppointments.map((appointment, index) => (
                      <li key={index} className="appointment-item">
                        <span className="appointment-time">{new Date(appointment.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                        <span className="appointment-status">Booked</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}