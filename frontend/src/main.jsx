import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: 'DM Sans, sans-serif', fontSize: '13px' },
          success: { style: { background: '#2d7d46', color: '#fff' } },
          error:   { style: { background: '#b03030', color: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
