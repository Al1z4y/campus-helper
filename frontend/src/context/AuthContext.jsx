import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem('user')
    const storedRole = localStorage.getItem('role')
    
    if (storedUser && storedRole) {
      setUser({
        username: storedUser,
        role: storedRole
      })
    }
  }, [])

  const login = (username, role) => {
    const userData = { username, role }
    localStorage.setItem('user', username)
    localStorage.setItem('role', role)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

