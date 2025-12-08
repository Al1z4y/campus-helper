import { useState, useEffect } from 'react'
import axios from 'axios'
import { Mail, Calendar, FileText, Clock, CheckCircle, RefreshCw, AlertCircle, TrendingUp, Activity } from 'lucide-react'
import clsx from 'clsx'

function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get('/api/profile')
      setProfile(response.data)
    } catch (err) {
      setError('Failed to load profile. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
  }

  const getStatusBadgeClasses = (status) => {
    return clsx(
      'px-2 py-1 text-xs font-semibold rounded-full',
      {
        'bg-yellow-100 text-yellow-800': status === 'Pending',
        'bg-blue-100 text-blue-800': status === 'In Progress',
        'bg-green-100 text-green-800': status === 'Resolved' || status === 'Completed',
        'bg-gray-100 text-gray-800': !['Pending', 'In Progress', 'Resolved', 'Completed'].includes(status)
      }
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <RefreshCw className="animate-spin mx-auto text-blue-600 mb-4" size={32} />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center">
          <AlertCircle className="text-red-500 mr-3" size={20} />
          <div>
            <p className="text-red-700 font-medium">{error || 'Failed to load profile'}</p>
            <button
              onClick={fetchProfile}
              className="text-red-600 hover:text-red-800 text-sm underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Requests',
      value: profile.stats.total_requests,
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-500'
    },
    {
      label: 'Pending',
      value: profile.stats.pending_requests,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-500'
    },
    {
      label: 'In Progress',
      value: profile.stats.in_progress_requests,
      icon: Activity,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-500'
    },
    {
      label: 'Resolved',
      value: profile.stats.resolved_requests,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-500'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">View your account information and activity</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600" />
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
            {/* Avatar */}
            <div className="-mt-16 mb-4 md:mb-0">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                <span className="text-white text-5xl font-bold">
                  {profile.user.username ? profile.user.username.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profile.user.username}</h2>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail size={16} />
                  <span>{profile.user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={clsx(
                    'inline-block px-3 py-1 text-sm font-medium rounded-full',
                    profile.user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  )}>
                    {profile.user.role === 'admin' ? 'Administrator' : 'Student'}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>Joined {formatDate(profile.user.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div>
              <button
                onClick={fetchProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <RefreshCw size={18} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={clsx(
                'bg-white rounded-xl shadow-lg p-6 border-l-4',
                stat.borderColor
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <div className={clsx('p-2 rounded-lg', stat.bgColor)}>
                  <Icon className={stat.textColor} size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              {stat.label === 'Resolved' && profile.stats.total_requests > 0 && (
                <div className="mt-2 flex items-center space-x-1 text-sm text-green-600">
                  <TrendingUp size={14} />
                  <span>{Math.round((stat.value / profile.stats.total_requests) * 100)}% completion rate</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
        
        {profile.recent_requests.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No recent requests</p>
            <p className="text-sm text-gray-500 mt-1">Your recent service requests will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.recent_requests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-gray-500">#{request.id}</span>
                      <span className="text-sm font-medium text-gray-900">{request.category}</span>
                      <span className={getStatusBadgeClasses(request.status)}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{request.description}</p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>{formatDate(request.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
