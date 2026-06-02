import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { ExternalLink, ArrowLeft } from 'lucide-react'
import L from 'leaflet'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapPage() {
  const navigate = useNavigate()

  // 1. LOCKED BOUNDS (Updated for the new 31.522 coordinates)
  // This ensures the user stays focused on the area you provided
  const fccBounds = [
    [31.5180, 74.3250], // Bottom Left
    [31.5280, 74.3400]  // Top Right
  ]

  // 2. YOUR EXACT LOCATIONS
  const campusLocations = [
    {
      id: 1,
      name: 'D-Block',
      position: [31.522824, 74.334873], 
      description: 'Academic Block & Classrooms'
    },
    {
      id: 2,
      name: 'Lucas Center',
      position: [31.522535, 74.332534],
      description: 'Sports Complex, Gym & Basketball Courts'
    },
    {
      id: 3,
      name: 'Hope Tower',
      position: [31.523415, 74.331476], 
      description: 'Student Hostel'
    },
    {
      id: 4,
      name: 'FC College Main Parking',
      position: [31.522155, 74.330505],
      description: 'Main entry parking area'
    },
    {
      id: 5,
      name: 'FCCU Cricket Ground',
      position: [31.522193, 74.333092],
      description: 'Main sports ground'
    }
  ]

  // Centered right in the middle of your points (between Lucas Center and Cricket Ground)
  const center = [31.522500, 74.332500]

  const getDirectionsUrl = (position) => {
    const [lat, lng] = position
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }

  return (
    <div className="relative" style={{ height: 'calc(100vh - 80px)', width: '100%' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-[1000] bg-white text-gray-800 px-4 py-2 rounded-full shadow-xl flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200 font-medium"
      >
        <ArrowLeft size={18} />
        <span>Back to Campus</span>
      </button>

      <MapContainer
        center={center}
        zoom={17} // Zoomed in closer since these buildings are near each other
        minZoom={16} // Don't let them zoom out too far
        maxBounds={fccBounds}
        maxBoundsViscosity={0.8}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {campusLocations.map((location) => (
          <Marker key={location.id} position={location.position}>
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-gray-900 mb-1 text-lg">{location.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{location.description}</p>
                <a
                  href={getDirectionsUrl(location.position)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-white bg-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>Get Directions</span>
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default MapPage