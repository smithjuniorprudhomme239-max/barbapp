import { useState } from 'react'
import './Gallery.css'
import './GalleryPage.css'

const photos = [
  { src: 'https://i.postimg.cc/8cyqL4xQ/b4d3697f32db8.png', alt: 'Precision fade haircut' },
  { src: 'https://i.postimg.cc/bwMSmj1D/16469749dce31.png', alt: 'Beard grooming' },
  { src: 'https://i.postimg.cc/d1JsBWNw/fa9fe0865cf9a.png', alt: 'Classic barber cut' },
  { src: 'https://i.postimg.cc/cL7Pmdpm/fccff0abbc93e.png', alt: 'Barbershop atmosphere' },
  { src: 'https://i.postimg.cc/W1DwN8nv/569ea474542e8.png', alt: 'Hot towel shave' },
  { src: 'https://i.postimg.cc/W3cB6h3y/8d096ebb6ebf38.png', alt: 'Stylish haircut' },
  { src: 'https://i.postimg.cc/RV6mT4Tp/image1.png', alt: 'Barber masterpiece' },
  { src: 'https://i.postimg.cc/zBrMT1fY/image-2.png', alt: 'Barber masterpiece 2' },
  { src: 'https://i.postimg.cc/nLHSLGSJ/image-3.png', alt: 'Barber masterpiece 3' },
  { src: 'https://i.postimg.cc/FHhwfv75/image4.png', alt: 'Barber masterpiece 4' },
  { src: 'https://i.postimg.cc/W3mMqBdf/image5.png', alt: 'Barber masterpiece 5' },
  { src: 'https://i.postimg.cc/tJSnhpp2/image6.png', alt: 'Barber masterpiece 6' },
  { src: 'https://i.postimg.cc/RhyVSFMJ/image7.png', alt: 'Barber masterpiece 7' },
  { src: 'https://i.postimg.cc/1R29N8QS/image8.png', alt: 'Barber masterpiece 8' },
  { src: 'https://i.postimg.cc/mhWfpFLN/image9.png', alt: 'Barber masterpiece 9' },
  { src: 'https://i.postimg.cc/ZKP5tJGt/im1.png', alt: 'Barber masterpiece 10' },
  { src: 'https://i.postimg.cc/fTsMv6JP/im2.png', alt: 'Barber masterpiece 11' },
  { src: 'https://i.postimg.cc/T294ZStn/im3.png', alt: 'Barber masterpiece 12' },
  { src: 'https://i.postimg.cc/vTNLGWg7/im4.png', alt: 'Barber masterpiece 13' },
  { src: 'https://i.postimg.cc/YCwLYnHK/im6.png', alt: 'Barber masterpiece 14' },
  { src: 'https://i.postimg.cc/ncq1QSW9/im7.png', alt: 'Barber masterpiece 15' },
]

export default function GalleryPage({ onBack }) {
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
    <div className="gallery-page">
      <div className="gallery-page-header">
        <button className="gallery-back-btn" onClick={onBack}>← Back</button>
        <div>
          <span className="gallery-label">OUR WORK</span>
          <h1>Full Gallery</h1>
          <p className="gallery-subtitle">Every cut tells a story</p>
        </div>
      </div>

      <div className="gallery-grid gallery-page-grid">
        {photos.map((photo, i) => (
          <div
            key={i}
            className={`gallery-item ${i === 0 || i === 3 ? 'tall' : ''}`}
            onClick={() => openLightbox(i)}
          >
            <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
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
    </div>
  )
}