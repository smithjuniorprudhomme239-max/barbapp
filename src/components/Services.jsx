import { useState } from 'react'
import './Services.css'

const services = [
  { icon: '✂️', name: 'Classic Haircut', price: '$25', desc: 'Clean cut tailored to your style.' },
  { icon: '⚡', name: 'Fade & Taper', price: '$30', desc: 'Sharp fades from skin to length.' },
  { icon: '🧔', name: 'Beard Trim', price: '$15', desc: 'Shape and define your beard.' },
  { icon: '🪒', name: 'Hot Towel Shave', price: '$45', desc: 'Traditional straight razor shave.' },
  { icon: '💈', name: 'Hair + Beard Combo', price: '$40', desc: 'Full grooming package.' },
  { icon: '👦', name: 'Kids Cut', price: '$25', desc: 'For the little ones, age 12 & under.' },
]

export default function Services() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section id="services" className="section services">
      <div className="services-header">
        <span className="services-label">WHAT WE OFFER</span>
        <h2>Our Services</h2>
        <p className="services-subtitle">Premium grooming for the modern gentleman</p>
      </div>
      <div className={`cards ${expanded ? 'expanded' : ''}`}>
        {services.map((s, i) => (
          <div key={s.name} className={`card ${i >= 2 ? 'collapsible' : ''}`}>
            <div className="card-icon">{s.icon}</div>
            <h3>{s.name}</h3>
            <p>{s.desc}</p>
            <div className="card-bottom">
              <span className="price">{s.price}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="services-toggle">
        <button className="toggle-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'See Less ▲' : 'See More ▼'}
        </button>
      </div>
    </section>
  )
}