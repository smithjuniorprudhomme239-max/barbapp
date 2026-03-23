import './About.css'

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="about-inner">
        <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600" alt="barber" />
        <div className="about-text">
          <h2>About Us</h2>
          <p>
            FadeKing has been serving the community for over 10 years. We believe every client
            deserves a premium experience — from the moment you walk in to the moment you leave
            looking your best.
          </p>
          <p>
            Our barbers are highly trained professionals passionate about their craft. Whether
            you want a classic cut or the latest trend, we've got you covered.
          </p>
          <div className="stats">
            <div><strong>10+</strong><span>Years Open</span></div>
            <div><strong>5k+</strong><span>Happy Clients</span></div>
            <div><strong>4</strong><span>Expert Barbers</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}
