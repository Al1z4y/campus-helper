import { useState, useEffect } from 'react'
import axios from 'axios'
import { RefreshCw, FileText, Clock, CheckCircle, Trash2, AlertCircle, Image as ImageIcon, Eye } from 'lucide-react'
import clsx from 'clsx'

function Dashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchRequests = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get('/api/requests')
      setRequests(response.data)
    } catch (err) {
      setError('Failed to fetch requests. Please try again.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleStatusChange = async (requestId, newStatus) => {
    setUpdatingId(requestId)
    try {
      const response = await axios.put(`/api/requests/${requestId}`, {
        status: newStatus
      })
      
      // Update the local state
      setRequests(requests.map(req => 
        req.id === requestId ? response.data : req
      ))
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return
    }

    setDeletingId(requestId)
    try {
      await axios.delete(`/api/requests/${requestId}`)
      
      // Remove from local state
      setRequests(requests.filter(req => req.id !== requestId))
    } catch (err) {
      console.error('Error deleting request:', err)
      alert('Failed to delete request. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // Calculate stats
  const totalRequests = requests.length
  const pendingRequests = requests.filter(req => req.status === 'Pending').length
  const resolvedRequests = requests.filter(req => 
    req.status === 'Resolved' || req.status === 'Completed'
  ).length

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getMonth()]
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    const displayMinutes = minutes.toString().padStart(2, '0')
    return `${month} ${day}, ${displayHours}:${displayMinutes} ${ampm}`
  }

  // Get status badge classes
  const getStatusBadgeClasses = (status) => {
    return clsx(
      'px-3 py-1 text-xs font-semibold rounded-full',
      {
        'bg-yellow-100 text-yellow-800': status === 'Pending',
        'bg-blue-100 text-blue-800': status === 'In Progress',
        'bg-green-100 text-green-800': status === 'Resolved' || status === 'Completed',
        'bg-gray-100 text-gray-800': !['Pending', 'In Progress', 'Resolved', 'Completed'].includes(status)
      }
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and track all service requests</p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-md hover:shadow-lg"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6 flex items-center">
          <AlertCircle className="text-red-500 mr-3" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Requests Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{totalRequests}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="text-blue-600" size={28} />
            </div>
          </div>
        </div>

        {/* Pending Requests Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{pendingRequests}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="text-yellow-600" size={28} />
            </div>
          </div>
        </div>

        {/* Resolved Requests Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Resolved</p>
              <p className="text-3xl font-bold text-gray-900">{resolvedRequests}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <RefreshCw className="animate-spin mx-auto text-blue-600 mb-4" size={32} />
          <p className="text-gray-600">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 text-lg">No service requests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    #ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr 
                    key={request.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{request.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{formatDate(request.timestamp)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{request.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 max-w-md truncate" title={request.description}>
                        {request.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.image_url ? (
                        <div className="flex items-center space-x-2">
                          <img
                            src={`http://127.0.0.1:5000/${request.image_url}`}
                            alt={`Request ${request.id}`}
                            className="w-12 h-12 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(`http://127.0.0.1:5000/${request.image_url}`, '_blank')}
                            title="Click to view full image"
                          />
                          <a
                            href={`http://127.0.0.1:5000/${request.image_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </a>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 flex items-center space-x-1">
                          <ImageIcon size={16} />
                          <span>No image</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadgeClasses(request.status)}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {/* Status Dropdown */}
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusChange(request.id, e.target.value)}
                          disabled={updatingId === request.id}
                          className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Completed">Completed</option>
                        </select>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(request.id)}
                          disabled={deletingId === request.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete request"
                        >
                          {deletingId === request.id ? (
                            <RefreshCw size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
