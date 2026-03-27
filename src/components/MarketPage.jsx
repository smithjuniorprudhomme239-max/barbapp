import { useState, useEffect } from 'react'
import { supabase } from '../context/AuthContext'
import './MarketPage.css'

export default function MarketPage({ onBack }) {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from Supabase...')
        const { data, error } = await supabase
          .from('products')
          .select('*')
        
        if (error) {
          console.error('Error fetching products:', error)
          setLoading(false)
        } else {
          console.log('Products fetched successfully:', data)
          setProducts(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      } catch (error) {
        console.error('Unexpected error fetching products:', error)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const addToCart = (product) => {
    setCart([...cart, product])
  }

  const toggleCart = () => {
    setShowCart(!showCart)
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
        <div 
          className="cart-icon"
          onClick={toggleCart}
          style={{ cursor: 'pointer' }}
        >
          🛒 {cart.length}
        </div>
      </header>

      {/* Products Grid */}
      <section className="products-grid">
        {loading ? (
          <p className="loading-products">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="no-products">No products available.</p>
        ) : (
          products.map(product => (
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
          ))
        )}
      </section>

      {/* Cart Section */}
      {showCart && (
        <section className="cart-section">
          <h2>Your Cart ({cart.length})</h2>
          <div className="cart-items">
            {cart.length > 0 ? (
              cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <span>{item.name}</span>
                  <span>{item.price}</span>
                </div>
              ))
            ) : (
              <p className="empty-cart">Your cart is empty</p>
            )}
          </div>
          {cart.length > 0 && (
            <button className="checkout-btn">Checkout</button>
          )}
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