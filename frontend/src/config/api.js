import axios from 'axios'

// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001'

// Configure axios defaults
axios.defaults.baseURL = API_URL

// Add request interceptor to always include fresh token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default API_URL
