import api from "../utils/api"

export const productService = {
  // Get all products with filters
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get("/products", { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get single product
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Create product with images (Admin only)
  createProduct: async (productData) => {
    try {
      const formData = new FormData()

      // Add text fields
      formData.append("product_name", productData.product_name)
      formData.append("product_description", productData.product_description || "")
      formData.append("price", productData.price)
      formData.append("discount_price", productData.discount_price || productData.price)
      formData.append("category", productData.category)
      formData.append("subcategory", productData.subcategory || "")
      formData.append("stock", productData.stock || 0)
      formData.append("featured", productData.featured || false)
      formData.append("bestseller", productData.bestseller || false)

      // Add sizes and colors as comma-separated strings
      if (productData.sizes && productData.sizes.length > 0) {
        formData.append("sizes", productData.sizes.join(","))
      }
      if (productData.colors && productData.colors.length > 0) {
        formData.append("colors", productData.colors.join(","))
      }

      // Add images (max 3)
      if (productData.images && productData.images.length > 0) {
        productData.images.forEach((image, index) => {
          if (index < 3) {
            // Max 3 images
            formData.append("images", image)
          }
        })
      }

      const response = await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update product with images (Admin only)
  updateProduct: async (id, productData) => {
    try {
      const formData = new FormData()

      // Add text fields
      if (productData.product_name) formData.append("product_name", productData.product_name)
      if (productData.product_description !== undefined)
        formData.append("product_description", productData.product_description)
      if (productData.price) formData.append("price", productData.price)
      if (productData.discount_price) formData.append("discount_price", productData.discount_price)
      if (productData.category) formData.append("category", productData.category)
      if (productData.subcategory !== undefined) formData.append("subcategory", productData.subcategory)
      if (productData.stock !== undefined) formData.append("stock", productData.stock)
      if (productData.featured !== undefined) formData.append("featured", productData.featured)
      if (productData.bestseller !== undefined) formData.append("bestseller", productData.bestseller)

      // Add sizes and colors
      if (productData.sizes) {
        formData.append("sizes", Array.isArray(productData.sizes) ? productData.sizes.join(",") : productData.sizes)
      }
      if (productData.colors) {
        formData.append("colors", Array.isArray(productData.colors) ? productData.colors.join(",") : productData.colors)
      }

      // Handle image operations
      if (productData.replace_all_images) {
        formData.append("replace_all_images", "true")
      }

      if (productData.remove_images && productData.remove_images.length > 0) {
        productData.remove_images.forEach((imageUrl) => {
          formData.append("remove_images", imageUrl)
        })
      }

      // Add new images
      if (productData.new_images && productData.new_images.length > 0) {
        productData.new_images.forEach((image, index) => {
          if (index < 3) {
            formData.append("images", image)
          }
        })
      }

      const response = await api.put(`/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete product (Admin only)
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get featured products
  getFeaturedProducts: async (params = {}) => {
    try {
      const response = await api.get("/products/featured", { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get bestseller products
  getBestsellerProducts: async (params = {}) => {
    try {
      const response = await api.get("/products/bestseller", { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get product filters
  getProductFilters: async () => {
    try {
      const response = await api.get("/products/filters/options")
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}
