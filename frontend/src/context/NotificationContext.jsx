import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const NotificationContext = createContext()

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

function Notification({ notification, onClose }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
  }

  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-800',
      icon: 'text-green-600'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-800',
      icon: 'text-red-600'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-800',
      icon: 'text-blue-600'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-800',
      icon: 'text-yellow-600'
    }
  }

  const Icon = icons[notification.type] || Info
  const colorScheme = colors[notification.type] || colors.info

  return (
    <div
      className={clsx(
        'flex items-start space-x-3 p-4 rounded-lg shadow-lg border-l-4 mb-3 max-w-md animate-slide-in',
        colorScheme.bg,
        colorScheme.border
      )}
    >
      <Icon className={clsx('flex-shrink-0 mt-0.5', colorScheme.icon)} size={20} />
      <div className="flex-1">
        {notification.title && (
          <h4 className={clsx('font-semibold mb-1', colorScheme.text)}>
            {notification.title}
          </h4>
        )}
        <p className={clsx('text-sm', colorScheme.text)}>
          {notification.message}
        </p>
      </div>
      <button
        onClick={() => onClose(notification.id)}
        className={clsx(
          'flex-shrink-0 hover:opacity-70 transition-opacity',
          colorScheme.icon
        )}
      >
        <X size={18} />
      </button>
    </div>
  )
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((notification) => {
    const id = Date.now()
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    }

    setNotifications((prev) => [...prev, newNotification])

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const notify = {
    success: (message, title = 'Success') => 
      addNotification({ type: 'success', message, title }),
    error: (message, title = 'Error') => 
      addNotification({ type: 'error', message, title }),
    info: (message, title = '') => 
      addNotification({ type: 'info', message, title }),
    warning: (message, title = 'Warning') => 
      addNotification({ type: 'warning', message, title })
  }

  return (
    <NotificationContext.Provider value={{ notify, addNotification, removeNotification }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-[100] pointer-events-none">
        <div className="pointer-events-auto">
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              notification={notification}
              onClose={removeNotification}
            />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  )
}

export default NotificationProvider
