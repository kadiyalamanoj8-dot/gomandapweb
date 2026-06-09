import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n';
import './index.css'
import App from './App.jsx'

// PWA has been fully removed

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
