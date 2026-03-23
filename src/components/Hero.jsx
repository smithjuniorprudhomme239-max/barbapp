import './Hero.css'

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1>Look Sharp.<br />Feel Confident.</h1>
        <p>Premium cuts & grooming in the heart of the city.</p>
        <a href="#contact" className="hero-btn">Book an Appointment</a>
      </div>
    </section>
  )
}
