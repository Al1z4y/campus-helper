import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ServiceRequestModal from './components/ServiceRequestModal'
import ChatWidget from './components/ChatWidget'
import Login from './pages/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import MapPage from './pages/MapPage'
import AIChat from './pages/AIChat'
import Profile from './pages/Profile'

// Protected Route component
function ProtectedRoute({ children, requireAdmin = false }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

// Home Route - redirects admin to dashboard, shows feed for students
function HomeRoute() {
  const { user } = useAuth()
  
  if (user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  
  return <Home />
}

function App() {
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {user && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
        <div className={user && isSidebarOpen ? 'lg:ml-64' : ''}>
          <Navbar 
            onNewRequestClick={() => setIsModalOpen(true)} 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
          <main>
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <HomeRoute />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/map" 
                element={
                  <ProtectedRoute>
                    <MapPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <AIChat />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {user && user.role === 'student' && (
            <ServiceRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          )}
          {user && <ChatWidget />}
        </div>
      </div>
    </Router>
  )
}

export default App

