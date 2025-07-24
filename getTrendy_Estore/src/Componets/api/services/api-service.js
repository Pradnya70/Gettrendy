import axios from "axios"
import API_CONFIG from "./api-config"

const BASEURL = API_CONFIG.baseURL

const ApiService = {
  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem("token")
  },

  // Get headers with auth token
  getHeaders() {
    const token = this.getToken()
    return {
      "x-access-token": token,
      Authorization: `Bearer ${token}`,
    }
  },

  // Get headers for multipart form data
  getMultipartHeaders() {
    const token = this.getToken()
    return {
      "x-access-token": token,
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    }
  },

  // ==================== CATEGORY APIs ====================
  async getCategories(page = 1, limit = 10) {
    try {
      const response = await axios.get(`${BASEURL}/api/category?page=${page}&limit=${limit}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching categories:", error)
      throw error
    }
  },

  async getCategoryById(id) {
    try {
      const response = await axios.get(`${BASEURL}/api/category/${id}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching category:", error)
      throw error
    }
  },

  async createCategory(formData) {
    try {
      const response = await axios.post(`${BASEURL}/api/category`, formData, {
        headers: this.getMultipartHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error creating category:", error)
      throw error
    }
  },

  async updateCategory(id, formData) {
    try {
      const response = await axios.put(`${BASEURL}/api/category/${id}`, formData, {
        headers: this.getMultipartHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error updating category:", error)
      throw error
    }
  },

  async deleteCategory(id) {
    try {
      const response = await axios.delete(`${BASEURL}/api/category/${id}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error deleting category:", error)
      throw error
    }
  },

  // ==================== SUBCATEGORY APIs ====================
  async getSubcategories(page = 1, limit = 10, categoryId = null) {
    try {
      let url = `${BASEURL}/api/subcategory?page=${page}&limit=${limit}`
      if (categoryId) {
        url += `&category=${categoryId}`
      }
      const response = await axios.get(url, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching subcategories:", error)
      throw error
    }
  },

  async getSubcategoryById(id) {
    try {
      const response = await axios.get(`${BASEURL}/api/subcategory/${id}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching subcategory:", error)
      throw error
    }
  },

  async createSubcategory(formData) {
    try {
      const response = await axios.post(`${BASEURL}/api/subcategory`, formData, {
        headers: this.getMultipartHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error creating subcategory:", error)
      throw error
    }
  },

  async updateSubcategory(id, formData) {
    try {
      const response = await axios.put(`${BASEURL}/api/subcategory/${id}`, formData, {
        headers: this.getMultipartHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error updating subcategory:", error)
      throw error
    }
  },

  async deleteSubcategory(id) {
    try {
      const response = await axios.delete(`${BASEURL}/api/subcategory/${id}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error deleting subcategory:", error)
      throw error
    }
  },

  // ==================== PRODUCT APIs ====================
  async getProducts(page = 1, limit = 10, filters = {}) {
    try {
      let url = `${BASEURL}/api/products?page=${page}&limit=${limit}`
      if (filters.size) url += `&size=${filters.size}`
      if (filters.color) url += `&color=${filters.color}`
      if (filters.category) url += `&category=${filters.category}`
      if (filters.search) url += `&search=${filters.search}`
      if (filters.minPrice) url += `&minPrice=${filters.minPrice}`
      if (filters.maxPrice) url += `&maxPrice=${filters.maxPrice}`
      if (filters.featured) url += `&featured=${filters.featured}`
      if (filters.bestseller) url += `&bestseller=${filters.bestseller}`

      const response = await axios.get(url, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching products:", error)
      throw error
    }
  },

  async getProductById(id) {
    try {
      const response = await axios.get(`${BASEURL}/api/products/${id}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching product:", error)
      throw error
    }
  },

  async createProduct(formData) {
    try {
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`)
      }
      const response = await axios.post(`${BASEURL}/api/products`, formData, {
        headers: this.getMultipartHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  },

  async updateProduct(id, formData) {
    try {
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`)
      }
      const response = await axios.put(`${BASEURL}/api/products/${id}`, formData, {
        headers: this.getMultipartHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  },

  async deleteProduct(id) {
    try {
      const response = await axios.delete(`${BASEURL}/api/products/${id}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  },

  async getProductFilters() {
    try {
      const response = await axios.get(`${BASEURL}/api/products/filters/options`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching product filters:", error)
      throw error
    }
  },

  async getFeaturedProducts(page = 1, limit = 10) {
    try {
      const response = await axios.get(`${BASEURL}/api/products/featured?page=${page}&limit=${limit}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching featured products:", error)
      throw error
    }
  },

  async getBestsellerProducts(page = 1, limit = 10) {
    try {
      const response = await axios.get(`${BASEURL}/api/products/bestseller?page=${page}&limit=${limit}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching bestseller products:", error)
      throw error
    }
  },

  // ==================== USER APIs ====================
  async getUsers(page = 1, limit = 10) {
    try {
      const response = await axios.get(`${BASEURL}/api/users?page=${page}&limit=${limit}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  },

  // ==================== ORDER APIs ====================
  async placeOrder(orderData) {
    try {
      const response = await axios.post(`${BASEURL}/api/orders/place`, orderData, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error placing order:", error)
      throw error
    }
  },

  async getUserOrders(page = 1, limit = 10) {
    try {
      const response = await axios.get(`${BASEURL}/api/orders/myorders?page=${page}&limit=${limit}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching user orders:", error)
      throw error
    }
  },

  async getOrderById(orderId) {
    try {
      const response = await axios.get(`${BASEURL}/api/orders/${orderId}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching order:", error)
      throw error
    }
  },

  async getAllOrders() {
    try {
      const response = await axios.get(`${BASEURL}/api/orders`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching all orders:", error)
      throw error
    }
  },

  async getOrdersByUser(userId) {
    try {
      const response = await axios.get(`${BASEURL}/api/orders/user/${userId}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching orders by user:", error)
      throw error
    }
  },

  async updateOrderStatus(orderId, statusData) {
    try {
      const response = await axios.put(`${BASEURL}/api/orders/${orderId}/status`, statusData, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  },

  async markOrdersAsSeen(userId) {
    try {
      const response = await axios.put(
        `${BASEURL}/api/orders/user/${userId}/mark-seen`,
        {},
        {
          headers: this.getHeaders(),
        },
      )
      return response
    } catch (error) {
      console.error("Error marking orders as seen:", error)
      throw error
    }
  },

  async getUnseenOrdersCount() {
    try {
      const response = await axios.get(`${BASEURL}/api/orders/admin/unseen-count`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching unseen orders count:", error)
      throw error
    }
  },

  async downloadReceipt(orderId) {
    try {
      const response = await axios.get(`${BASEURL}/api/orders/receipt/${orderId}`, {
        headers: this.getHeaders(),
        responseType: "blob",
      })
      return response
    } catch (error) {
      console.error("Error downloading receipt:", error)
      throw error
    }
  },

  // ==================== CART APIs ====================
  async getCart() {
    try {
      const response = await axios.get(`${BASEURL}/api/cart`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching cart:", error)
      throw error
    }
  },

  async addToCart(productData) {
    try {
      const response = await axios.post(`${BASEURL}/api/cart/add`, productData, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error adding to cart:", error)
      throw error
    }
  },

  async updateCartItem(itemId, quantity) {
    try {
      const response = await axios.put(
        `${BASEURL}/api/cart/update/${itemId}`,
        { quantity },
        {
          headers: this.getHeaders(),
        },
      )
      return response
    } catch (error) {
      console.error("Error updating cart item:", error)
      throw error
    }
  },

  async removeFromCart(itemId) {
    try {
      const response = await axios.delete(`${BASEURL}/api/cart/remove/${itemId}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error removing from cart:", error)
      throw error
    }
  },

  async clearCart() {
    try {
      const response = await axios.delete(`${BASEURL}/api/cart/clear`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error clearing cart:", error)
      throw error
    }
  },

  // ==================== CONTACT APIs ====================
  async createContact(contactData) {
    try {
      const response = await axios.post(`${BASEURL}/api/contact`, contactData, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error creating contact:", error)
      throw error
    }
  },

  async getContacts() {
    try {
      const response = await axios.get(`${BASEURL}/api/contact`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching contacts:", error)
      throw error
    }
  },

  async getContactsByEmail(email) {
    try {
      const response = await axios.get(`${BASEURL}/api/contact/user/${email}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching contacts by email:", error)
      throw error
    }
  },

  async markContactsAsRead(email) {
    try {
      const response = await axios.put(
        `${BASEURL}/api/contact/user/${email}/read`,
        {},
        {
          headers: this.getHeaders(),
        },
      )
      return response
    } catch (error) {
      console.error("Error marking contacts as read:", error)
      throw error
    }
  },

  // ==================== RAZORPAY APIs ====================
  async createRazorpayOrder(orderData) {
    try {
      const response = await axios.post(`${BASEURL}/api/razorpay/create-order`, orderData, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error creating Razorpay order:", error)
      throw error
    }
  },

  async verifyRazorpayPayment(paymentData) {
    try {
      const response = await axios.post(`${BASEURL}/api/razorpay/verify-payment`, paymentData, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error verifying Razorpay payment:", error)
      throw error
    }
  },

  async handlePaymentFailure(errorData) {
    try {
      const response = await axios.post(`${BASEURL}/api/razorpay/payment-failed`, errorData, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error handling payment failure:", error)
      throw error
    }
  },

  async getPaymentDetails(paymentId) {
    try {
      const response = await axios.get(`${BASEURL}/api/razorpay/payment/${paymentId}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching payment details:", error)
      throw error
    }
  },

  async testRazorpay() {
    try {
      const response = await axios.get(`${BASEURL}/api/razorpay/test`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error testing Razorpay:", error)
      throw error
    }
  },

  // ==================== SHIPROCKET APIs ====================
  async createShiprocketOrder(orderData) {
    try {
      const response = await axios.post(`${BASEURL}/api/orders/shiprocket-order`, orderData, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error creating Shiprocket order:", error)
      throw error
    }
  },

  // ==================== AUTH APIs ====================
  async login(credentials) {
    try {
      const response = await axios.post(`${BASEURL}/api/auth/login`, credentials)
      return response
    } catch (error) {
      console.error("Error logging in:", error)
      throw error
    }
  },

  async register(userData) {
    try {
      const response = await axios.post(`${BASEURL}/api/auth/register`, userData)
      return response
    } catch (error) {
      console.error("Error registering:", error)
      throw error
    }
  },

  async getProfile() {
    try {
      const response = await axios.get(`${BASEURL}/api/auth/profile`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching profile:", error)
      throw error
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await axios.put(`${BASEURL}/api/auth/profile`, profileData, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  },

  // ==================== UPLOAD APIs ====================
  async uploadImage(formData) {
    try {
      const response = await axios.post(`${BASEURL}/api/upload`, formData, {
        headers: this.getMultipartHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  },

  async uploadMultipleImages(formData) {
    try {
      const response = await axios.post(`${BASEURL}/api/upload/multiple`, formData, {
        headers: this.getMultipartHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error uploading multiple images:", error)
      throw error
    }
  },
}

export default ApiService
