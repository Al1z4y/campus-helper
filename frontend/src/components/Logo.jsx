import { useState } from 'react'
import { GraduationCap } from 'lucide-react'

function Logo({ size = 32, className = '', showFallback = true }) {
  const [imageError, setImageError] = useState(false)

  if (imageError && showFallback) {
    // Fallback to icon if image fails to load
    return <GraduationCap className={`text-blue-600 ${className}`} size={size} />
  }

  if (imageError && !showFallback) {
    // Fallback to text "CH" for sidebar
    return (
      <span className={`text-white font-bold text-lg ${className}`} style={{ fontSize: `${size * 0.5}px` }}>
        CH
      </span>
    )
  }

  return (
    <img 
      src="/logo.png" 
      alt="Campus Helper Logo" 
      className={`object-contain ${className}`}
      style={{ height: `${size}px`, width: `${size}px` }}
      onError={() => setImageError(true)}
    />
  )
}

export default Logo

