import axios from "axios";
import API_CONFIG from "./api-config";
import { api } from "../../Client/Comman/CommanConstans";

const BASEURL = API_CONFIG.baseURL;

const ApiService = {
  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem("token");
  },

  // Get headers with auth token
  getHeaders() {
    const token = this.getToken();
    return {
      "x-access-token": token,
      Authorization: `Bearer ${token}`,
    };
  },

  // Get headers for multipart form data
  getMultipartHeaders() {
    const token = this.getToken();
    return {
      "x-access-token": token,
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };
  },

  // Category APIs
  async getCategories(page = 1, limit = 10) {
    try {
      const response = await axios.get(
        `${BASEURL}/api/category?page=${page}&limit=${limit}`,
        {
          headers: this.getHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  async getCategoryById(id) {
    try {
      const response = await axios.get(`${BASEURL}/api/category/${id}`, {
        headers: this.getHeaders(),
      });
      return response;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw error;
    }
  },

  async createCategory(formData) {
    try {
      const response = await axios.post(`${BASEURL}/api/category`, formData, {
        headers: this.getMultipartHeaders(),
      });
      return response;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  async updateCategory(id, formData) {
    try {
      const response = await axios.put(
        `${BASEURL}/api/category/${id}`,
        formData,
        {
          headers: this.getMultipartHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  async deleteCategory(id) {
    try {
      const response = await axios.delete(`${BASEURL}/api/category/${id}`, {
        headers: this.getHeaders(),
      });
      return response;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  // Subcategory APIs
  async getSubcategories(page = 1, limit = 10, categoryId = null) {
    try {
      let url = `${BASEURL}/api/subcategory?page=${page}&limit=${limit}`;
      if (categoryId) {
        url += `&category=${categoryId}`;
      }
      const response = await axios.get(url, {
        headers: this.getHeaders(),
      });
      return response;
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      throw error;
    }
  },

  async getSubcategoryById(id) {
    try {
      const response = await axios.get(`${BASEURL}/api/subcategory/${id}`, {
        headers: this.getHeaders(),
      });
      return response;
    } catch (error) {
      console.error("Error fetching subcategory:", error);
      throw error;
    }
  },

  async createSubcategory(formData) {
    try {
      const response = await axios.post(
        `${BASEURL}/api/subcategory`,
        formData,
        {
          headers: this.getMultipartHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error("Error creating subcategory:", error);
      throw error;
    }
  },

  async updateSubcategory(id, formData) {
    try {
      const response = await axios.put(
        `${BASEURL}/api/subcategory/${id}`,
        formData,
        {
          headers: this.getMultipartHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error("Error updating subcategory:", error);
      throw error;
    }
  },

  async deleteSubcategory(id) {
    try {
      const response = await axios.delete(`${BASEURL}/api/subcategory/${id}`, {
        headers: this.getHeaders(),
      });
      return response;
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      throw error;
    }
  },

  // Product APIs
  async getProducts(page = 1, limit = 10, filters = {}) {
    try {
      let url = `${BASEURL}/api/products?page=${page}&limit=${limit}`;
      if (filters.size) url += `&size=${filters.size}`;
      if (filters.color) url += `&color=${filters.color}`;
      if (filters.category) url += `&category=${filters.category}`;
      if (filters.search) url += `&search=${filters.search}`;
      if (filters.minPrice) url += `&minPrice=${filters.minPrice}`;
      if (filters.maxPrice) url += `&maxPrice=${filters.maxPrice}`;
      if (filters.featured) url += `&featured=${filters.featured}`;
      if (filters.bestseller) url += `&bestseller=${filters.bestseller}`;
      const response = await axios.get(url, {
        headers: this.getHeaders(),
      });
      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  async getProductById(id) {
    try {
      const response = await axios.get(`${BASEURL}/api/products/${id}`, {
        headers: this.getHeaders(),
      });
      return response;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  async createProduct(formData) {
    try {
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      const response = await axios.post(`${BASEURL}/api/products`, formData, {
        headers: this.getMultipartHeaders(),
      });
      return response;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  async updateProduct(id, formData) {
    try {
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      const response = await axios.put(
        `${BASEURL}/api/products/${id}`,
        formData,
        {
          headers: this.getMultipartHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  async deleteProduct(id) {
    try {
      const response = await axios.delete(`${BASEURL}/api/products/${id}`, {
        headers: this.getHeaders(),
      });
      return response;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  async getProductFilters() {
    try {
      const response = await axios.get(
        `${BASEURL}/api/products/filters/options`,
        {
          headers: this.getHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching product filters:", error);
      throw error;
    }
  },

  async getFeaturedProducts(page = 1, limit = 10) {
    try {
      const response = await axios.get(
        `${BASEURL}/api/products/featured?page=${page}&limit=${limit}`,
        {
          headers: this.getHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching featured products:", error);
      throw error;
    }
  },

  async getBestsellerProducts(page = 1, limit = 10) {
    try {
      const response = await axios.get(
        `${BASEURL}/api/products/bestseller?page=${page}&limit=${limit}`,
        {
          headers: this.getHeaders(),
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching bestseller products:", error);
      throw error;
    }
  },

  getUsers(page = 1, limit = 10) {
    return api.get(`/api/users?page=${page}&limit=${limit}`);
  },

  getOrdersByUser(userId) {
    return axios.get(`${BASEURL}/api/orders/user/${userId}`);
  },

  getAllOrders() {
    return axios.get(`${BASEURL}/api/orders`);
  },

  getContactsByEmail: (email) =>
    axios.get(`${BASEURL}/api/contact/user/${email}`),
  markContactsAsRead: (email) =>
    axios.put(`${BASEURL}/api/contact/user/${email}/read`),
};

export default ApiService;
