import { useState } from 'react'
import { mockAnnouncements } from '../data/mockAnnouncements'
import { AlertCircle, Calendar, Newspaper, Clock } from 'lucide-react'

function Home() {
  const [filter, setFilter] = useState('All')

  const getTypeColor = (type) => {
    switch (type) {
      case 'Alert':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Event':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'News':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Alert':
        return <AlertCircle size={20} />
      case 'Event':
        return <Calendar size={20} />
      case 'News':
        return <Newspaper size={20} />
      default:
        return null
    }
  }

  const filteredAnnouncements = filter === 'All' 
    ? mockAnnouncements 
    : mockAnnouncements.filter(ann => ann.type === filter)

  const filterButtons = ['All', 'Event', 'Alert', 'News']

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">📢 Latest Campus Announcements</h2>
        
        {/* Filter Bar */}
        <div className="flex items-center space-x-2">
          {filterButtons.map((btn) => (
            <button
              key={btn}
              onClick={() => setFilter(btn)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === btn
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col justify-between hover:shadow-xl transition-shadow duration-200"
          >
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {/* Avatar Placeholder */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {announcement.author.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{announcement.author}</h3>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>{announcement.time}</span>
                    </div>
                  </div>
                </div>
                {/* Type Badge */}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 flex-shrink-0 ${getTypeColor(
                    announcement.type
                  )}`}
                >
                  {getTypeIcon(announcement.type)}
                  <span>{announcement.type}</span>
                </span>
              </div>

              {/* Title - Distinct Header */}
              <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{announcement.title}</h2>
            </div>

            {/* Content - Body Text */}
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{announcement.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
