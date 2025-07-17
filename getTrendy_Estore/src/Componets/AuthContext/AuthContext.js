"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { BASEURL } from "../Client/Comman/CommanConstans"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [userId, setUserId] = useState(null)
  const [userToken, setUserToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profileImage, setProfileImage] = useState(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true)
      const token = localStorage.getItem("token")
      const role = localStorage.getItem("role")
      const id = localStorage.getItem("userId")
      const userName = localStorage.getItem("userName")
      const profileImg = localStorage.getItem("profileImage")

      console.log("Initializing auth with:", { token: !!token, role, id })

      if (token) {
        setUserToken(token)
        setUserRole(role)
        setUserId(id)
        setIsAuthenticated(true)
        setUser({
          name: userName || "",
          _id: id,
          role: role,
          profileImage: profileImg || "",
        })
        setProfileImage(profileImg || "")

        try {
          // Verify token validity
          const response = await axios.get(`${BASEURL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          })

          if (response.data && response.data.user) {
            const userData = response.data.user
            setUserRole(userData.role)
            setUserId(userData._id)
            setUser(userData)
            setProfileImage(userData.profileImage || "")

            // Update localStorage with latest user data
            localStorage.setItem("role", userData.role)
            localStorage.setItem("userId", userData._id)
            localStorage.setItem("userName", userData.name || "")
            localStorage.setItem("profileImage", userData.profileImage || "")
          }
        } catch (error) {
          console.error("Token verification failed:", error)
          // Don't log out on verification failure - just keep using localStorage data
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("userId")
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userName")
    localStorage.removeItem("profileImage")

    // Clear state
    setIsAuthenticated(false)
    setUserRole(null)
    setUserToken(null)
    setUserId(null)
    setUser(null)
    setProfileImage(null)

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("auth-changed"))
  }

  const login = async (token, role, id, userName, profileImg = "") => {
    console.log("Login called with:", { token: !!token, role, id, userName })

    // Store in localStorage
    localStorage.setItem("token", token)
    localStorage.setItem("role", role)
    localStorage.setItem("userId", id || "")
    localStorage.setItem("userName", userName || "")
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("profileImage", profileImg || "")

    // Update state
    setUserToken(token)
    setUserRole(role)
    setUserId(id)
    setIsAuthenticated(true)
    setUser({
      name: userName,
      _id: id,
      role: role,
      profileImage: profileImg || "",
    })
    setProfileImage(profileImg || "")

    console.log("Auth state updated:", { role, isAuthenticated: true })

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("auth-changed"))
  }

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    console.log("Checking role:", { userRole, requiredRole })
    return userRole === requiredRole
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        login,
        logout: handleLogout,
        userToken,
        userId,
        hasRole,
        loading,
        user,
        profileImage,
        setProfileImage,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
