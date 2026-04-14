import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/appkit' // initializes Reown AppKit
import App from './App.jsx'

// Set initial theme before render to avoid flash
const savedTheme = localStorage.getItem('deadswitch-theme') || 'dark'
document.body.className = `theme-${savedTheme}`

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
