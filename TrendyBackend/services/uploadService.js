import api from "../utils/api"

export const uploadService = {
  // Upload single image
  uploadImage: async (file) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete single image
  deleteImage: async (publicId) => {
    try {
      const response = await api.post("/upload/delete", { publicId })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete multiple images
  deleteMultipleImages: async (publicIds) => {
    try {
      const response = await api.post("/upload/delete-multiple", { publicIds })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}
