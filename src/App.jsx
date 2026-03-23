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
import './App.css'

function AppContent() {
  const [page, setPage] = useState('home')
  const { adminToken } = useAuth()

  if (page === 'adminLogin') return <Login onSuccess={() => setPage('admin')} />
  if (page === 'admin' && adminToken) return <Admin onLogout={() => setPage('home')} />
  if (page === 'admin' && !adminToken) return <Login onSuccess={() => setPage('admin')} />
  if (page === 'userAuth') return <UserAuth onSuccess={() => setPage('home')} onClose={() => setPage('home')} />

  return (
    <>
      <Navbar onAdminClick={() => setPage('adminLogin')} onUserAuthClick={() => setPage('userAuth')} />
      <Hero />
      <Services />
      <Gallery />
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
