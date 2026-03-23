import './Services.css'

const services = [
  { name: 'Classic Haircut', price: '$25', desc: 'Clean cut tailored to your style.' },
  { name: 'Fade & Taper', price: '$30', desc: 'Sharp fades from skin to length.' },
  { name: 'Beard Trim', price: '$15', desc: 'Shape and define your beard.' },
  { name: 'Hot Towel Shave', price: '$45', desc: 'Traditional straight razor shave.' },
  { name: 'Hair + Beard Combo', price: '$40', desc: 'Full grooming package.' },
  { name: 'Kids Cut', price: '$25', desc: 'For the little ones, age 12 & under.' },
]

export default function Services() {
  return (
    <section id="services" className="section services">
      <h2>Our Services</h2>
      <div className="cards">
        {services.map(s => (
          <div key={s.name} className="card">
            <h3>{s.name}</h3>
            <p>{s.desc}</p>
            <span className="price">{s.price}</span>
          </div>
        ))}
      </div>
    </section>
  )
}