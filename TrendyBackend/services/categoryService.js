import api from "../utils/api"

export const categoryService = {
  // Get all categories
  getAllCategories: async (params = {}) => {
    try {
      const response = await api.get("/category", { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get single category
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/category/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Create category with image (Admin only)
  createCategory: async (categoryData) => {
    try {
      const formData = new FormData()

      formData.append("category_name", categoryData.category_name)
      formData.append("category_description", categoryData.category_description || "")

      // Add image if provided
      if (categoryData.category_image) {
        formData.append("category_image", categoryData.category_image)
      }

      const response = await api.post("/category", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update category with image (Admin only)
  updateCategory: async (id, categoryData) => {
    try {
      const formData = new FormData()

      if (categoryData.category_name) formData.append("category_name", categoryData.category_name)
      if (categoryData.category_description !== undefined)
        formData.append("category_description", categoryData.category_description)

      // Add new image if provided
      if (categoryData.category_image) {
        formData.append("category_image", categoryData.category_image)
      }

      const response = await api.put(`/category/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete category (Admin only)
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/category/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}
