import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import './styles/layout.css'
import './styles/panel.css'
import './styles/list.css'
import './styles/buttons.css'
import './styles/table.css'
import './styles/toast.css'
import './styles/components.css'
import './styles/filters.css'
import './styles/utilities.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
