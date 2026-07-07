import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((reg) => {
    // When a new SW is waiting, activate it immediately
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          window.location.reload()
        }
      })
    })
  })

  // If a new SW took control while the page was open, reload
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
