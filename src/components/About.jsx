import './About.css'

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="about-inner">
        <img src="https://i.postimg.cc/G3NKT651/ca8e3d0da04c9.png" alt="barber" loading="lazy" decoding="async" />
        <div className="about-text">
          <h2>About Us</h2>
          <p>
            DuckensBarber has been serving the community for over 2 years. We believe every client
            deserves a premium experience — from the moment you walk in to the moment you leave
            looking your best.
          </p>
          <p>
            Our barbers are highly trained professionals passionate about their craft. Whether
            you want a classic cut or the latest trend, we've got you covered.
          </p>
          
        </div>
      </div>
    </section>
  )
}