import { useState } from 'react'
import './Gallery.css'

const photos = [
  { src: 'https://i.postimg.cc/8cyqL4xQ/b4d3697f32db8.png', alt: 'Precision fade haircut' },
  { src: 'https://i.postimg.cc/bwMSmj1D/16469749dce31.png', alt: 'Beard grooming' },
  { src: 'https://i.postimg.cc/d1JsBWNw/fa9fe0865cf9a.png', alt: 'Classic barber cut' },
  { src: 'https://i.postimg.cc/cL7Pmdpm/fccff0abbc93e.png', alt: 'Barbershop atmosphere' },
  { src: 'https://i.postimg.cc/W1DwN8nv/569ea474542e8.png', alt: 'Hot towel shave' },
  { src: 'https://i.postimg.cc/W3cB6h3y/8d096ebb6ebf38.png', alt: 'Stylish haircut' },
]

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState(null)

  const openLightbox = (index) => {
    setSelectedIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
    document.body.style.overflow = 'auto'
  }

  const goNext = (e) => {
    e.stopPropagation()
    setSelectedIndex((selectedIndex + 1) % photos.length)
  }

  const goPrev = (e) => {
    e.stopPropagation()
    setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length)
  }

  return (
    <section id="gallery" className="section gallery">
      <div className="gallery-header">
        <span className="gallery-label">OUR WORK</span>
        <h2>Gallery</h2>
        <p className="gallery-subtitle">See the craftsmanship behind every cut</p>
      </div>

      <div className="gallery-grid">
        {photos.map((photo, i) => (
          <div
            key={i}
            className={`gallery-item ${i === 0 || i === 3 ? 'tall' : ''}`}
            onClick={() => openLightbox(i)}
          >
            <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" fetchpriority="low" />
            <div className="gallery-overlay">
              <span className="gallery-zoom">🔍</span>
            </div>
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-nav lightbox-prev" onClick={goPrev}>‹</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>×</button>
            <img src={photos[selectedIndex].src} alt={photos[selectedIndex].alt} />
            <p className="lightbox-caption">{photos[selectedIndex].alt}</p>
          </div>
          <button className="lightbox-nav lightbox-next" onClick={goNext}>›</button>
        </div>
      )}
    </section>
  )
}