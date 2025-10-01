import { createContext, useContext, useState } from "react"


const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null)
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken") || null)

  const login = (access, refresh) => {
    setToken(access)
    setRefreshToken(refresh)
    localStorage.setItem("token", access)
    localStorage.setItem("refreshToken", refresh)
  }

  const logout = () => {
    setToken(null)
    setRefreshToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  return (
    <AuthContext.Provider value={{ token, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
