import { useNavigate, useLocation } from 'react-router-dom'
import { Plus, LogOut, LogIn, LayoutDashboard, GraduationCap, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Navbar({ onNewRequestClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user?.role === 'admin'
  const maxWidth = isAdmin ? 'max-w-7xl' : 'max-w-7xl'

  // If not logged in, show only Login
  if (!user) {
    return (
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center space-x-3">
              <GraduationCap className="text-blue-600" size={32} />
              <h1 className="text-2xl font-bold text-blue-600">CampusConnect</h1>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <LogIn size={18} />
              <span>Login</span>
            </button>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className={`${maxWidth} mx-auto`}>
        <div className="flex justify-between items-center px-6 py-4">
          {/* LEFT SIDE - Logo */}
          <div className="flex items-center space-x-3">
            <GraduationCap className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-blue-600">CampusConnect</h1>
          </div>

          {/* RIGHT SIDE - Navigation */}
          <div className="flex items-center space-x-3">
            {isAdmin && (
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-4 py-2 rounded-full transition-colors font-medium flex items-center space-x-2 ${
                  location.pathname === '/dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
            )}
            <button
              onClick={() => navigate('/map')}
              className={`px-4 py-2 rounded-full transition-colors font-medium flex items-center space-x-2 ${
                location.pathname === '/map'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MapPin size={18} />
              <span>Map</span>
            </button>
            {user.role === 'student' && (
              <button
                onClick={onNewRequestClick}
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 shadow-md"
              >
                <Plus size={18} />
                <span>New Request</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors font-medium flex items-center space-x-2"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

