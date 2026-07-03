import { useState, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import './Contact.css'

const SERVICES = [
  'Classic Haircut',
  'Fade & Taper',
  'Beard Trim',
  'Hot Towel Shave',
  'Hair + Beard Combo',
  'Kids Cut'
]

const WEEKDAY_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM'
]

const SUNDAY_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'
]

const BOSTON_TZ = 'America/New_York'

function getBostonToday() {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: BOSTON_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  return parts
}

function getDayOfWeek(dateStr) {
  if (!dateStr) return -1
  const [y, m, d] = dateStr.split('-').map(Number)
  const utcDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  return utcDate.getUTCDay()
}

function isSunday(dateStr) {
  return getDayOfWeek(dateStr) === 0
}

export default function Contact() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', phone: '', date: getBostonToday(), time: '', service: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field, value) => {
    if (field === 'date') {
      setForm(prev => ({ ...prev, date: value, time: '' }))
    } else {
      setForm(prev => ({ ...prev, [field]: value }))
    }
  }

  const timeSlots = useMemo(() => {
    return isSunday(form.date) ? SUNDAY_SLOTS : WEEKDAY_SLOTS
  }, [form.date])

  const canNext = () => {
    if (step === 1) return form.service !== ''
    if (step === 2) return form.date !== '' && form.time !== ''
    return true
  }

  const submit = async e => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const dateTime = `${form.date}T${convertTime(form.time)}`

    try {
      const { error: supabaseError } = await supabase
        .from('bookings')
        .insert([{
          name: form.name,
          phone: form.phone,
          service: form.service,
          date: dateTime
        }])

      if (supabaseError) {
        setError(supabaseError.message || 'Booking failed.')
      } else {
        setSent(true)
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const convertTime = (t) => {
    const [time, period] = t.split(' ')
    let [h, m] = time.split(':')
    h = parseInt(h)
    if (period === 'PM' && h !== 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${m}:00`
  }

  const resetForm = () => {
    setSent(false)
    setForm({ name: '', phone: '', date: getBostonToday(), time: '', service: '' })
    setStep(1)
  }

  const bostonToday = getBostonToday()

  if (sent) {
    return (
      <section id="contact" className="section contact">
        <div className="booking-success">
          <div className="success-icon">✓</div>
          <h2>Appointment Booked!</h2>
          <p>Thanks, <strong>{form.name}</strong>! Your <strong>{form.service}</strong> is scheduled for:</p>
          <p className="success-date">
            {new Date(form.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: BOSTON_TZ })}
            {' '}at {form.time}
          </p>
          <p className="success-note">We'll send you a confirmation shortly.</p>
          <button className="okay-button" onClick={resetForm}>
            Book Another
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="section contact">
      <div className="booking-container">
        <h2>Book an Appointment</h2>
        <p className="booking-subtitle">Quick and easy — no account needed</p>

        <div className="booking-steps">
          <span className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</span>
          <span className={`step-line ${step >= 2 ? 'active' : ''}`} />
          <span className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</span>
          <span className={`step-line ${step >= 3 ? 'active' : ''}`} />
          <span className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</span>
        </div>

        <form onSubmit={submit} className="booking-form">
          {/* Step 1: Choose Service */}
          {step === 1 && (
            <div className="step-content">
              <h3>Choose Your Service</h3>
              <div className="service-grid">
                {SERVICES.map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`service-card ${form.service === s ? 'selected' : ''}`}
                    onClick={() => update('service', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Pick Date & Time */}
          {step === 2 && (
            <div className="step-content">
              <h3>Pick Date &amp; Time</h3>
              <p className="step-hint">
                {isSunday(form.date) ? 'Sunday hours: 10 AM – 4 PM' : 'Mon–Sat: 9 AM – 7 PM'}
              </p>
              <input
                type="date"
                value={form.date}
                min={bostonToday}
                onChange={e => update('date', e.target.value)}
                required
              />
              <div className="time-grid">
                {timeSlots.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`time-slot ${form.time === t ? 'selected' : ''}`}
                    onClick={() => update('time', t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Your Info */}
          {step === 3 && (
            <div className="step-content">
              <h3>Your Details</h3>
              <input
                name="name"
                placeholder="Your Full Name"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                required
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                required
              />
              {error && <p className="form-error">{error}</p>}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="step-buttons">
            {step > 1 && (
              <button type="button" className="btn-back" onClick={() => setStep(step - 1)}>
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" className="btn-next" onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()}>
                Continue →
              </button>
            ) : (
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </form>

        <div className="contact-info">
          <p>✉️ dukenssmithp@gmail.com</p>
          <p>🕐 Mon–Sat: 9am – 7pm</p>
          <p>🕐 Sun: 10am – 4pm</p>
        </div>
      </div>
    </section>
  )
}