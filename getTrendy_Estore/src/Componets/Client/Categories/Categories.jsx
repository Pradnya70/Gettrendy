import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axios, API_ENDPOINTS } from "../Comman/CommanConstans";
import { toast } from "react-toastify";
import "./Categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching categories from:", API_ENDPOINTS.CATEGORY.LIST);

      const response = await axios.get(API_ENDPOINTS.CATEGORY.LIST);
      console.log("Categories response:", response.data);

      if (response.data && response.data.rows) {
        setCategories(response.data.rows);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error.response?.data?.message || "Failed to load categories");

      // Implement retry logic
      if (retryCount < 3) {
        setRetryCount((prev) => prev + 1);
        console.log(`Retrying category fetch (attempt ${retryCount + 1})...`);
        setTimeout(fetchCategories, 2000); // Retry after 2 seconds
      } else {
        toast.error("Failed to load categories. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="categories-loading">
        <div className="loading-spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-error">
        <p>{error}</p>
        <button
          onClick={() => {
            setRetryCount(0);
            fetchCategories();
          }}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="categories-empty">
        <p>No categories found</p>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <h2>Categories</h2>
      <div className="categories-grid">
        {categories.map((category) => (
          <Link
            to={`/category/${category._id}`}
            key={category._id}
            className="category-card"
          >
            <div className="category-image">
              {category.category_image ? (
                <img
                  src={`${
                    process.env.REACT_APP_API_URL || "http://localhost:5000"
                  }${category.category_image}`}
                  alt={category.category_name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-image.png";
                  }}
                />
              ) : (
                <div className="category-placeholder">
                  {category.category_name.charAt(0)}
                </div>
              )}
            </div>
            <div className="category-info">
              <h3>{category.category_name}</h3>
              {category.category_description && (
                <p>{category.category_description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
