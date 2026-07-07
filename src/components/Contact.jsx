import { useState, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import './Contact.css'

const SERVICES = [
  'Classic Haircut',
  'Fade & Taper',
  'Beard Trim',
  'Hot Towel Shave',
  'Hair + Beard Combo',
  'Kids Cut',
  'Line Up'
]

const WEEKDAY_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM'
]

const SUNDAY_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM'
]

const BOSTON_TZ = 'America/New_York'

function toBostonISO(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h, min] = timeStr.split(':').map(Number)

  const Y = String(y).padStart(4, '0')
  const M = String(m).padStart(2, '0')
  const D = String(d).padStart(2, '0')
  const H = String(h).padStart(2, '0')
  const MN = String(min).padStart(2, '0')

  const utcDate = new Date(Date.UTC(y, m - 1, d, h, min, 0))
  const bostonParts = new Intl.DateTimeFormat('en-US', {
    timeZone: BOSTON_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(utcDate)

  const bostonHour = parseInt(bostonParts.find(p => p.type === 'hour').value)
  const bostonMinute = parseInt(bostonParts.find(p => p.type === 'minute').value)

  const inputMinutes = h * 60 + min
  const bostonMinutes = bostonHour * 60 + bostonMinute
  let offsetMinutes = bostonMinutes - inputMinutes
  if (offsetMinutes > 720) offsetMinutes -= 1440
  if (offsetMinutes < -720) offsetMinutes += 1440

  const offsetSign = offsetMinutes >= 0 ? '+' : '-'
  const absOffset = Math.abs(offsetMinutes)
  const offsetH = String(Math.floor(absOffset / 60)).padStart(2, '0')
  const offsetM = String(absOffset % 60).padStart(2, '0')

  return `${Y}-${M}-${D}T${H}:${MN}:00${offsetSign}${offsetH}:${offsetM}`
}

function getBostonToday() {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BOSTON_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit'
  })
  return formatter.format(now)
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
  const [form, setForm] = useState({ name: '', date: getBostonToday(), time: '', service: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bookedSlots, setBookedSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    supabase.from('bookings').select('id').limit(1)
  }, [])

  useEffect(() => {
    if (!form.date) return
    const fetchBookedSlots = async () => {
      setLoadingSlots(true)
      setBookedSlots([])
      try {
        const startOfDay = toBostonISO(form.date, '00:00:00')
        const endOfDay = toBostonISO(form.date, '23:59:00')
        const { data } = await supabase
          .from('bookings')
          .select('date')
          .gte('date', startOfDay)
          .lte('date', endOfDay)

        if (data) {
          const booked = data.map(b => {
            const d = new Date(b.date + (b.date.includes('T') ? '' : 'T00:00:00'))
            const hours = d.getHours()
            const minutes = d.getMinutes()
            const period = hours >= 12 ? 'PM' : 'AM'
            const displayHour = hours % 12 === 0 ? 12 : hours % 12
            return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`
          })
          setBookedSlots(booked)
        }
      } catch (err) {
        console.error('Failed to fetch booked slots:', err)
      } finally {
        setLoadingSlots(false)
      }
    }
    fetchBookedSlots()
  }, [form.date])

  const update = (field, value) => {
    if (field === 'date') {
      setForm(prev => ({ ...prev, date: value, time: '' }))
    } else {
      setForm(prev => ({ ...prev, [field]: value }))
    }
    setError('')
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

    const dateTime = toBostonISO(form.date, convertTime(form.time))

    try {
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('date', dateTime)
        .limit(1)

      if (existing && existing.length > 0) {
        setError('This time slot is already taken. Please pick another time.')
        setSubmitting(false)
        return
      }

      const { error: supabaseError } = await supabase
        .from('bookings')
        .insert([{
          name: form.name,
          service: form.service,
          date: dateTime
        }])

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        setError(supabaseError.message || 'Booking failed.')
      } else {
        setSent(true)
      }
    } catch (err) {
      console.error('Booking error:', err)
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
    setForm({ name: '', date: getBostonToday(), time: '', service: '' })
    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
            ← Back to Home
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
                Daily: 9 AM – 6:30 PM
              </p>
              <input
                type="date"
                value={form.date}
                min={bostonToday}
                onChange={e => update('date', e.target.value)}
                required
              />
              {loadingSlots && <p className="loading-slots">Loading available times...</p>}
              <div className="time-grid">
                {timeSlots.map(t => {
                  const isBooked = bookedSlots.includes(t)
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`time-slot ${form.time === t ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                      onClick={() => !isBooked && update('time', t)}
                      disabled={isBooked}
                      title={isBooked ? 'This time slot is already taken. Please choose another one.' : ''}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Your Info */}
          {step === 3 && (
            <div className="step-content">
              <h3>Your Details</h3>
              <input
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={e => update('name', e.target.value)}
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
          <p>🕐 Daily: 9 AM – 6:30 PM</p>
        </div>
      </div>
    </section>
  )
}