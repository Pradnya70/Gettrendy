"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { BASEURL } from "../Componets/Client/Comman/CommanConstans"
import { useAuth } from "../AuthContext/AuthContext"
import { toast } from "react-toastify"

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { userToken, isAuthenticated } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch cart items when component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated && userToken) {
      fetchCartItems()
    } else {
      setCartItems([])
    }
  }, [isAuthenticated, userToken])

  // Listen for auth changes from other components
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("token")
      if (token) {
        fetchCartItems()
      } else {
        setCartItems([])
      }
    }

    window.addEventListener("auth-changed", handleAuthChange)

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange)
    }
  }, [])

  const fetchCartItems = async () => {
    if (!userToken) {
      setCartItems([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`${BASEURL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })

      if (response.data && response.data.items) {
        setCartItems(response.data.items)
      } else if (response.data) {
        setCartItems(response.data)
      } else {
        setCartItems([])
      }
    } catch (error) {
      console.error("Error fetching cart items:", error)
      setError("Failed to fetch cart items")
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product, quantity = 1, size = "M", color = "Default") => {
    if (!userToken) {
      toast.warning("Please login to add items to cart")
      return false
    }

    try {
      setLoading(true)

      const productId = product._id || product.id

      if (!productId) {
        console.error("Invalid product ID:", product)
        toast.error("Invalid product data")
        setLoading(false)
        return false
      }

      const response = await axios.post(
        `${BASEURL}/api/cart/add`,
        {
          productId,
          quantity,
          size,
          color,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      )

      if (response.data) {
        // Update cart items based on response
        if (response.data.cart && response.data.cart.items) {
          setCartItems(response.data.cart.items)
        } else if (response.data.items) {
          setCartItems(response.data.items)
        } else if (Array.isArray(response.data)) {
          setCartItems(response.data)
        }

        toast.success("Product added to cart successfully!")
        setLoading(false)
        return true
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      const errorMessage = error.response?.data?.message || "Failed to add product to cart"
      toast.error(errorMessage)
      setLoading(false)
      return false
    }
  }

  const removeFromCart = async (productId) => {
    if (!userToken) {
      return
    }

    try {
      setLoading(true)

      const response = await axios.post(
        `${BASEURL}/api/cart/remove`,
        { productId },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      )

      if (response.data) {
        // Update cart items based on response
        if (response.data.cart && response.data.cart.items) {
          setCartItems(response.data.cart.items)
        } else if (response.data.items) {
          setCartItems(response.data.items)
        } else if (Array.isArray(response.data)) {
          setCartItems(response.data)
        }

        toast.success("Product removed from cart")
      }
    } catch (error) {
      console.error("Error removing from cart:", error)
      toast.error("Failed to remove product from cart")
    } finally {
      setLoading(false)
    }
  }

  const updateCartQuantity = async (productId, quantity) => {
    if (!userToken || quantity < 1) {
      return
    }

    try {
      setLoading(true)

      const response = await axios.post(
        `${BASEURL}/api/cart/update`,
        {
          productId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      )

      if (response.data) {
        // Update cart items based on response
        if (response.data.cart && response.data.cart.items) {
          setCartItems(response.data.cart.items)
        } else if (response.data.items) {
          setCartItems(response.data.items)
        } else if (Array.isArray(response.data)) {
          setCartItems(response.data)
        }
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error)
      toast.error("Failed to update cart quantity")
    } finally {
      setLoading(false)
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        fetchCartItems,
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
