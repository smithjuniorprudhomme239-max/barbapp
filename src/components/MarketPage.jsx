import { useState } from 'react'
import './MarketPage.css'

// Sample products data
const products = [
  {
    id: 1,
    name: 'Barber Apron',
    price: '$25.00',
    description: 'Professional barber apron with multiple pockets',
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'Hair Clippers',
    price: '$120.00',
    description: 'Professional grade hair clippers',
    image: 'https://images.unsplash.com/photo-1591370874394-168492a94f59?w=300&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'Beard Oil',
    price: '$15.00',
    description: 'Premium beard oil for a healthy beard',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop'
  },
  {
    id: 4,
    name: 'Pomade',
    price: '$18.00',
    description: 'Strong hold pomade for styling',
    image: 'https://images.unsplash.com/photo-1581044777550-6928f5b7be1a?w=300&h=300&fit=crop'
  }
]

export default function MarketPage({ onBack }) {
  const [cart, setCart] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)

  const addToCart = (product) => {
    setCart([...cart, product])
  }

  const openLightbox = (product) => {
    setSelectedProduct(product)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedProduct(null)
    document.body.style.overflow = 'auto'
  }

  return (
    <div className="market-page">
      {/* Header */}
      <header className="market-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <h1>Market</h1>
        <div className="cart-icon">
          🛒 {cart.length}
        </div>
      </header>

      {/* Products Grid */}
      <section className="products-grid">
        {products.map(product => (
          <div 
            key={product.id} 
            className="product-card"
            onClick={() => openLightbox(product)}
          >
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-price">{product.price}</p>
              <p className="product-description">{product.description}</p>
              <button 
                className="add-to-cart-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  addToCart(product)
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Cart Section */}
      {cart.length > 0 && (
        <section className="cart-section">
          <h2>Your Cart ({cart.length})</h2>
          <div className="cart-items">
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <span>{item.name}</span>
                <span>{item.price}</span>
              </div>
            ))}
          </div>
          <button className="checkout-btn">Checkout</button>
        </section>
      )}

      {/* Lightbox */}
      {selectedProduct && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>×</button>
            <div className="product-card lightbox-product-card">
              <div className="product-image">
                <img src={selectedProduct.image} alt={selectedProduct.name} />
              </div>
              <div className="product-info">
                <h3>{selectedProduct.name}</h3>
                <p className="product-price">{selectedProduct.price}</p>
                <p className="product-description">{selectedProduct.description}</p>
                <button 
                  className="add-to-cart-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    addToCart(selectedProduct)
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}