import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Home, 
  LayoutDashboard, 
  Map, 
  MessageCircle, 
  User, 
  LogOut, 
  X
} from 'lucide-react'
import clsx from 'clsx'

function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
      description: 'Campus home',
      studentOnly: true  // Hide from admin since they get redirected to dashboard
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      description: 'View requests',
      adminOnly: true
    },
    {
      name: 'Campus Map',
      path: '/map',
      icon: Map,
      description: 'Interactive map'
    },
    {
      name: 'AI Assistant',
      path: '/chat',
      icon: MessageCircle,
      description: 'Ask questions'
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      description: 'Your profile'
    }
  ]

  const filteredMenuItems = menuItems.filter(item => {
    // Hide admin-only items from students
    if (item.adminOnly && user?.role !== 'admin') return false
    // Hide student-only items from admins
    if (item.studentOnly && user?.role === 'admin') return false
    return true
  })

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out',
          'flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'w-64'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CH</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Campus Helper</h2>
              <p className="text-xs text-gray-500">FCCU</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              <span className={clsx(
                'inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full',
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              )}>
                {user?.role === 'admin' ? 'Admin' : 'Student'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                  'group hover:bg-gray-50',
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                    : 'text-gray-700'
                )}
              >
                <Icon 
                  size={20} 
                  className={clsx(
                    'transition-transform group-hover:scale-110',
                    isActive ? 'text-white' : 'text-gray-600'
                  )} 
                />
                <div className="flex-1">
                  <p className={clsx(
                    'font-medium text-sm',
                    isActive ? 'text-white' : 'text-gray-900'
                  )}>
                    {item.name}
                  </p>
                  <p className={clsx(
                    'text-xs',
                    isActive ? 'text-blue-100' : 'text-gray-500'
                  )}>
                    {item.description}
                  </p>
                </div>
              </Link>
            )
          })}

        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors group"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">Logout</p>
              <p className="text-xs text-red-400">Sign out</p>
            </div>
          </button>
          
          <div className="text-center text-xs text-gray-500">
            <p>© 2025 Campus Helper</p>
            <p className="text-[10px] mt-1">Forman Code Fest 2025</p>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Logout</h3>
                <p className="text-sm text-gray-600">Are you sure?</p>
              </div>
            </div>
            
            <p className="text-gray-700">
              You will need to login again to access your account.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
