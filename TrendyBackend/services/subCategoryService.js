import api from "../utils/api"

export const subCategoryService = {
  // Get all subcategories
  getAllSubCategories: async (params = {}) => {
    try {
      const response = await api.get("/subcategory", { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get single subcategory
  getSubCategoryById: async (id) => {
    try {
      const response = await api.get(`/subcategory/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Create subcategory with image (Admin only)
  createSubCategory: async (subCategoryData) => {
    try {
      const formData = new FormData()

      formData.append("subcategory_name", subCategoryData.subcategory_name)
      formData.append("subcategory_description", subCategoryData.subcategory_description || "")
      formData.append("parent_category", subCategoryData.parent_category)

      // Add image if provided
      if (subCategoryData.subcategory_logo) {
        formData.append("subcategory_logo", subCategoryData.subcategory_logo)
      }

      const response = await api.post("/subcategory", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update subcategory with image (Admin only)
  updateSubCategory: async (id, subCategoryData) => {
    try {
      const formData = new FormData()

      if (subCategoryData.subcategory_name) formData.append("subcategory_name", subCategoryData.subcategory_name)
      if (subCategoryData.subcategory_description !== undefined)
        formData.append("subcategory_description", subCategoryData.subcategory_description)
      if (subCategoryData.parent_category) formData.append("parent_category", subCategoryData.parent_category)

      // Add new image if provided
      if (subCategoryData.subcategory_logo) {
        formData.append("subcategory_logo", subCategoryData.subcategory_logo)
      }

      const response = await api.put(`/subcategory/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete subcategory (Admin only)
  deleteSubCategory: async (id) => {
    try {
      const response = await api.delete(`/subcategory/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}
