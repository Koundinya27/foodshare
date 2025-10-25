import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            padding: '16px',
            borderRadius: 'var(--radius-base)',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--color-error)',
              secondary: 'white',
            },
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>,
)
