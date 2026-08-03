import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AdminApp } from './AdminApp'
import './admin.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AdminApp />
    </HashRouter>
  </StrictMode>,
)
