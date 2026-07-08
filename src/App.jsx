import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import Gallery from './components/Gallery'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Login from './components/Login'
import Admin from './components/Admin'
import UserAuth from './components/UserAuth'
import MarketPage from './components/MarketPage'
import GalleryPage from './components/GalleryPage'
import MobileShell from './components/MobileShell'
import './App.css'

function isNativeApp() {
  return document.body.classList.contains('is-native-app')
}

function AppContent() {
  const [page, setPage] = useState('home')
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (isNativeApp()) {
    return <MobileShell />
  }

  if (page === 'adminLogin') return <Login onSuccess={() => setPage('admin')} onClose={() => setPage('home')} />
  if (page === 'admin' && user) return <Admin onLogout={() => setPage('home')} />
  if (page === 'admin' && !user) return <Login onSuccess={() => setPage('admin')} onClose={() => setPage('home')} />
  if (page === 'userAuth') return <UserAuth onSuccess={() => setPage('home')} onClose={() => setPage('home')} />
  if (page === 'market') return <MarketPage onBack={() => setPage('home')} />
  if (page === 'gallery') return <GalleryPage onBack={() => setPage('home')} />

  return (
    <>
      <Navbar onAdminClick={() => setPage('admin')} onUserAuthClick={() => setPage('userAuth')} onMarketClick={() => setPage('market')} />
      <Hero />
      <Services />
      <Gallery onViewMore={() => setPage('gallery')} />
      <About />
      <Contact />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}