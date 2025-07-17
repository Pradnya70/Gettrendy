"use client"

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "./AuthContext"
import Loader from "../Client/Loader/Loader"

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, userRole, loading } = useAuth()
  const [authorized, setAuthorized] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    console.log("ProtectedRoute check:", { loading, isAuthenticated, userRole, requiredRole: role })

    if (loading) return

    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login")
      setAuthorized(false)
      // Redirect to login with return path
      navigate("/login", {
        state: { from: location },
        replace: true,
      })
      return
    }

    // Check if user has the required role
    const validRoles = {
      user: ["user", "Customer"], // User can be either 'user' or 'Customer'
      admin: ["admin"],
      Store_admin: ["admin"], // Map Store_admin to admin role
    }

    const hasValidRole = role ? validRoles[role]?.includes(userRole) : true

    console.log("Role validation:", {
      requiredRole: role,
      userRole,
      validRoles: validRoles[role],
      hasValidRole,
    })

    if (!hasValidRole) {
      console.log("User doesn't have required role, redirecting to unauthorized")
      setAuthorized(false)
      // Redirect to unauthorized page
      navigate("/unauthorized", { replace: true })
      return
    }

    console.log("User authorized")
    setAuthorized(true)
  }, [isAuthenticated, userRole, role, loading, location, navigate])

  if (loading) {
    return <Loader />
  }

  if (!authorized) {
    return null
  }

  return children
}

export default ProtectedRoute
