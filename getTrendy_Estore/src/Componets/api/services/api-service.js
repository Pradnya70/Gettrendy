import axios from "axios"
import API_CONFIG from "./api-config"

const BASEURL = API_CONFIG.baseURL

class ApiService {
  // Get auth token from localStorage
  static getToken() {
    return localStorage.getItem("token")
  }

  // Get headers with auth token
  static getHeaders() {
    const token = this.getToken()
    return {
      "x-access-token": token,
      Authorization: `Bearer ${token}`, // Add both headers for compatibility
    }
  }

  // Get headers for multipart form data
  static getMultipartHeaders() {
    const token = this.getToken()
    return {
      "x-access-token": token,
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    }
  }

  // Category APIs
  static async getCategories(page = 1, limit = 10) {
    try {
      const response = await axios.get(`${BASEURL}/api/category?page=${page}&limit=${limit}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching categories:", error)
      throw error
    }
  }

  static async getCategoryById(id) {
    try {
      const response = await axios.get(`${BASEURL}/api/category/${id}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching category:", error)
      throw error
    }
  }

  static async createCategory(formData) {
    try {
      const response = await axios.post(`${BASEURL}/api/category`, formData, {
        headers: this.getMultipartHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error creating category:", error)
      throw error
    }
  }

  static async updateCategory(id, formData) {
    try {
      const response = await axios.put(`${BASEURL}/api/category/${id}`, formData, {
        headers: this.getMultipartHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error updating category:", error)
      throw error
    }
  }

  static async deleteCategory(id) {
    try {
      const response = await axios.delete(`${BASEURL}/api/category/${id}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error deleting category:", error)
      throw error
    }
  }

  // Subcategory APIs
  static async getSubcategories(page = 1, limit = 10, categoryId = null) {
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
  }

  static async getSubcategoryById(id) {
    try {
      const response = await axios.get(`${BASEURL}/api/subcategory/${id}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching subcategory:", error)
      throw error
    }
  }

  static async createSubcategory(formData) {
    try {
      const response = await axios.post(`${BASEURL}/api/subcategory`, formData, {
        headers: this.getMultipartHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error creating subcategory:", error)
      throw error
    }
  }

  static async updateSubcategory(id, formData) {
    try {
      const response = await axios.put(`${BASEURL}/api/subcategory/${id}`, formData, {
        headers: this.getMultipartHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error updating subcategory:", error)
      throw error
    }
  }

  static async deleteSubcategory(id) {
    try {
      const response = await axios.delete(`${BASEURL}/api/subcategory/${id}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error deleting subcategory:", error)
      throw error
    }
  }

  // Product APIs
  static async getProducts(page = 1, limit = 10, filters = {}) {
    try {
      let url = `${BASEURL}/api/products?page=${page}&limit=${limit}`

      // Add filters to URL if they exist
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
  }

  static async getProductById(id) {
    try {
      const response = await axios.get(`${BASEURL}/api/products/${id}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching product:", error)
      throw error
    }
  }

  static async createProduct(formData) {
    try {
      // Log FormData content before sending
      console.log("API Service: createProduct FormData content:")
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
  }

  static async updateProduct(id, formData) {
    try {
      // Log FormData content before sending
      console.log("API Service: updateProduct FormData content:")
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
  }

  static async deleteProduct(id) {
    try {
      const response = await axios.delete(`${BASEURL}/api/products/${id}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }

  static async getProductFilters() {
    try {
      const response = await axios.get(`${BASEURL}/api/products/filters/options`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching product filters:", error)
      throw error
    }
  }

  static async getFeaturedProducts(page = 1, limit = 10) {
    try {
      const response = await axios.get(`${BASEURL}/api/products/featured?page=${page}&limit=${limit}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching featured products:", error)
      throw error
    }
  }

  static async getBestsellerProducts(page = 1, limit = 10) {
    try {
      const response = await axios.get(`${BASEURL}/api/products/bestseller?page=${page}&limit=${limit}`, {
        headers: this.getHeaders(),
      })
      return response
    } catch (error) {
      console.error("Error fetching bestseller products:", error)
      throw error
    }
  }
}

export default ApiService
