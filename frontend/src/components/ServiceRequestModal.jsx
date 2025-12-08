import { useState, useRef } from 'react'
import axios from 'axios'
import { X, Wrench, Monitor, GraduationCap, Search, Upload, Send, CheckCircle } from 'lucide-react'

function ServiceRequestModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [formData, setFormData] = useState({
    category: '',
    description: '',
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const fileInputRef = useRef(null)

  const categories = [
    { value: 'Maintenance', label: 'Maintenance', icon: Wrench, color: 'bg-orange-500' },
    { value: 'IT Support', label: 'IT Support', icon: Monitor, color: 'bg-blue-500' },
    { value: 'Academic', label: 'Academic', icon: GraduationCap, color: 'bg-purple-500' },
    { value: 'Lost & Found', label: 'Lost & Found', icon: Search, color: 'bg-green-500' },
  ]

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setFormData({ ...formData, category })
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setShowSuccess(false)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('category', formData.category)
      formDataToSend.append('description', formData.description)
      
      if (selectedFile) {
        formDataToSend.append('attachment', selectedFile)
      }

      const response = await axios.post('/api/requests', formDataToSend)

      if (response.status === 201) {
        setShowSuccess(true)
        setTimeout(() => {
          handleClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    setStep(1)
    setSelectedCategory('')
    setFormData({ category: '', description: '' })
    setSelectedFile(null)
    setShowSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 ? 'What kind of request?' : 'Submit Service Request'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showSuccess ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
              <p className="text-gray-600">Your service request has been received.</p>
            </div>
          ) : step === 1 ? (
            // Step 1: Category Selection
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.value}
                    onClick={() => handleCategorySelect(cat.value)}
                    className={`${cat.color} text-white p-8 rounded-xl hover:opacity-90 transition-all transform hover:scale-105 flex flex-col items-center justify-center space-y-4 shadow-lg`}
                  >
                    <Icon size={48} />
                    <span className="text-xl font-semibold">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            // Step 2: Form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-700">
                  {selectedCategory}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Describe your service request in detail..."
                />
              </div>

              {/* File Upload */}
              <div>
                <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment/Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    id="attachment"
                    name="attachment"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <label
                    htmlFor="attachment"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="text-gray-400" size={32} />
                    <span className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                    </span>
                    <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                  </label>
                </div>
                
                {selectedFile && (
                  <div className="mt-3 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                >
                  <Send size={20} />
                  <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceRequestModal

