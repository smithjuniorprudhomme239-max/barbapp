import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Contact.css'

export default function Contact() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', date: '', service: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setError('')

    if (!user) return setError('Please login or sign up to book an appointment.')

    const token = localStorage.getItem('token')
    const res = await fetch('http://100.111.241.53:5000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    })

    if (res.ok) setSent(true)
    else { const d = await res.json(); setError(d.error || 'Booking failed.') }
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
        {sent ? (
          <div className="thanks">
            <h3>Thanks, {form.name}! 🎉</h3>
            <p>We'll confirm your appointment shortly.</p>
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
    </section>
  )
}
