import React from 'react'
import ReactDOM from 'react-dom/client'
import './config/api'  // Import axios configuration first
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

