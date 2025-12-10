import { createContext, useContext, useState, useEffect } from "react"
import { me } from "../services/getMe"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null)
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken") || null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await me()
          setUser(userData)
        } catch (error) {
          console.error("Failed to fetch user", error)
          logout()
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    fetchUser()
  }, [token])

  const login = (access, refresh) => {
    setToken(access)
    setRefreshToken(refresh)
    localStorage.setItem("token", access)
    localStorage.setItem("refreshToken", refresh)
  }

  const logout = () => {
    setToken(null)
    setRefreshToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  return (
    <AuthContext.Provider value={{ token, refreshToken, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
