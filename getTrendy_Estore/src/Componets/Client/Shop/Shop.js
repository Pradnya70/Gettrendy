"use client";

import { useEffect, useState } from "react";
import "./Shop.css";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { FaHeart, FaStar } from "react-icons/fa";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import Footer from "../Footer/Footer";
import { BASEURL, authUtils, cartUtils } from "../Comman/CommanConstans";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const Shop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [pagesCount, setPagesCount] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [inCartStatus, setInCartStatus] = useState({});
  const [allCategoryList, setAllCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(6);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Top rated products (static for now)
  const [topRatedProducts] = useState([
    {
      id: 1,
      name: "Track Pants",
      price: 49.0,
      image: "/Images/Slim-Fit Joggers.jpg",
      rating: 5,
    },
    {
      id: 2,
      name: "Wristbands or Socks",
      price: 60.0,
      image: "/Images/Wristbands or Socks.jpg",
      rating: 4,
    },
    {
      id: 3,
      name: "Backpacks",
      price: 30.0,
      image: "/Images/Everyday Casual Backpack.jpg",
      rating: 5,
    },
  ]);

  // Get category from location state if available
  useEffect(() => {
    if (location.state && location.state.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location.state]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (selectedCategory) {
        params.append("category", selectedCategory);
      }

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      params.append("minPrice", priceRange[0].toString());
      params.append("maxPrice", priceRange[1].toString());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      console.log("Fetching products with params:", params.toString());

      const response = await axios.get(
        `${BASEURL}/api/products?${params.toString()}`
      );

      console.log("Products response:", response.data);

      if (response.data) {
        // Handle different response formats
        let productData = [];
        let totalPages = 1;
        let total = 0;

        if (response.data.rows && Array.isArray(response.data.rows)) {
          productData = response.data.rows;
          totalPages = response.data.pages_count || 1;
          total = response.data.count || 0;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          productData = response.data.data;
          totalPages = response.data.totalPages || 1;
          total = response.data.total || 0;
        } else if (Array.isArray(response.data)) {
          productData = response.data;
          totalPages = Math.ceil(response.data.length / limit);
          total = response.data.length;
        } else {
          console.error("Unexpected product data format:", response.data);
          productData = [];
        }

        setProducts(productData);
        setPagesCount(totalPages);
        setTotalCount(total);
      } else {
        setProducts([]);
        setPagesCount(1);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
      setProducts([]);
      setPagesCount(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASEURL}/api/category`);

      console.log("Categories response:", response.data);

      if (response.data) {
        let categoryData = [];

        if (response.data.rows && Array.isArray(response.data.rows)) {
          categoryData = response.data.rows;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          categoryData = response.data.data;
        } else if (Array.isArray(response.data)) {
          categoryData = response.data;
        }

        setAllCategoryList(categoryData);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setAllCategoryList([]);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };

    fetchAllData();
  }, [
    page,
    limit,
    selectedCategory,
    searchQuery,
    priceRange,
    sortBy,
    sortOrder,
  ]);

  // Check cart status for products
  useEffect(() => {
    const checkCartStatus = async () => {
      if (authUtils.isAuthenticated() && products.length > 0) {
        try {
          const cartItems = await cartUtils.fetchCartItems();
          const cartProductIds = cartItems.map(
            (item) => item.productId?._id || item.productId
          );

          const newInCartStatus = {};
          products.forEach((product) => {
            newInCartStatus[product._id] = cartProductIds.includes(product._id);
          });
          setInCartStatus(newInCartStatus);
        } catch (error) {
          console.error("Error checking cart status:", error);
        }
      } else {
        // Clear cart status if not authenticated
        setInCartStatus({});
      }
    };

    checkCartStatus();

    // Listen for cart changes
    const handleCartChange = () => {
      checkCartStatus();
    };

    window.addEventListener("cart-changed", handleCartChange);

    return () => {
      window.removeEventListener("cart-changed", handleCartChange);
    };
  }, [products]);

  const handleAddToCart = async (product) => {
    try {
      if (!authUtils.isAuthenticated()) {
        toast.warning("Please login to add items to cart");
        navigate("/login");
        return;
      }

      // Validate product data
      if (!product || !product._id) {
        toast.error("Invalid product data");
        return;
      }

      console.log("Adding product to cart:", product);

      // Temporarily set loading state for this product
      setInCartStatus((prev) => ({
        ...prev,
        [product._id]: "loading",
      }));

      // Add product to cart
      const result = await cartUtils.addToCart(product, 1, "M", "Default");

      if (result.success) {
        toast.success(result.message || "Product added to cart successfully!");
        // Update in-cart status for this product
        setInCartStatus((prev) => ({
          ...prev,
          [product._id]: true,
        }));
      } else {
        toast.error(result.message || "Failed to add product to cart");
        // Reset status on failure
        setInCartStatus((prev) => ({
          ...prev,
          [product._id]: false,
        }));
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
      // Reset status on error
      setInCartStatus((prev) => ({
        ...prev,
        [product._id]: false,
      }));
    }
  };

  const handleRemoveFromCart = async (product) => {
    try {
      if (!authUtils.isAuthenticated()) {
        toast.warning("Please login to manage cart");
        return;
      }

      console.log("Removing product from cart:", product);

      // Temporarily set loading state for this product
      setInCartStatus((prev) => ({
        ...prev,
        [product._id]: "loading",
      }));

      // Remove product from cart
      const result = await cartUtils.removeFromCart(
        product._id,
        "M",
        "Default"
      );

      if (result.success) {
        toast.success("Product removed from cart");
        // Update in-cart status for this product
        setInCartStatus((prev) => ({
          ...prev,
          [product._id]: false,
        }));
      } else {
        toast.error(result.message || "Failed to remove product from cart");
        // Reset status on failure
        setInCartStatus((prev) => ({
          ...prev,
          [product._id]: true,
        }));
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove from cart");
      // Reset status on error
      setInCartStatus((prev) => ({
        ...prev,
        [product._id]: true,
      }));
    }
  };

  const handleViewProduct = (productId) => {
    navigate("/perticularproductpage", {
      state: { productId },
    });
    window.scroll(0, 0);
  };

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleCategoryChange = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scroll(0, 0);
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setPriceRange([0, 10000]);
    setSortBy("name");
    setSortOrder("asc");
    setPage(1);
  };

  const handleViewMoreCategories = () => {
    setVisibleCategoryCount(allCategoryList.length);
  };

  const handleViewLessCategories = () => {
    setVisibleCategoryCount(6);
  };

  // Helper functions
  const renderCategoryName = (category) => {
    if (!category) return "Category";
    if (typeof category === "string") return category;
    return category.category_name || category.name || "Category";
  };

  const getProductName = (product) => {
    return product.product_name || product.name || "Product";
  };

  const getProductPrice = (product) => {
    return product.price || product.product_price || 0;
  };

  const getProductImage = (product) => {
    // Handle different image field formats
    let imagePath = null;

    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      imagePath = product.images[0];
    } else if (product.image) {
      imagePath = product.image;
    } else if (product.product_image) {
      imagePath = product.product_image;
    }

    if (imagePath) {
      // Check if the path already includes the base URL
      if (imagePath.startsWith("http")) {
        return imagePath;
      }
      // Add base URL if it doesn't start with /
      if (!imagePath.startsWith("/")) {
        imagePath = "/" + imagePath;
      }
      return `${BASEURL}${imagePath}`;
    }

    return "/Images/placeholder.jpg";
  };

  const truncateText = (text, limit) => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  const discountAmount = (price, rate) => {
    const amount = (price * rate) / 100;
    const originalPrice = price + amount;
    return originalPrice.toFixed(2);
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill()
      .map((_, i) => (
        <FaStar key={i} color={i < rating ? "#ffc107" : "#e4e5e9"} size={14} />
      ));
  };

  // Calculate display range
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalCount);

  return (
    <>
      <ToastContainer />
      {loading && <Loader />}
      <div className="shop-container" style={{ paddingTop: "150px" }}>
        <div className="container wide">
          <div className="row">
            {/* Sidebar */}
            <div className="col-md-3">
              <div className="shop-sidebar">
                {/* Search */}
                <div className="filter-section">
                  <h4>Search Products</h4>
                  <div className="search-box">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSearch}
                      className="search-button mt-2"
                    >
                      Search
                    </Button>
                  </div>
                </div>

                {/* Price Filter */}
                <div className="filter-section">
                  <h4>Price Range</h4>
                  <Box sx={{ width: "100%" }}>
                    <Slider
                      value={priceRange}
                      onChange={handlePriceChange}
                      valueLabelDisplay="auto"
                      max={10000}
                      min={0}
                    />
                    <div className="price-range-display d-flex justify-content-between">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </Box>
                </div>

                {/* Categories */}
                <div className="filter-section">
                  <h4>Categories</h4>
                  {Array.isArray(allCategoryList) &&
                  allCategoryList.length > 0 ? (
                    <div>
                      <ul className="category-list">
                        {allCategoryList
                          .slice(0, visibleCategoryCount)
                          .map((category) => (
                            <li
                              key={category._id}
                              className={`category-item ${
                                selectedCategory === category._id
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => handleCategoryChange(category._id)}
                            >
                              {renderCategoryName(category)}
                            </li>
                          ))}
                      </ul>
                      {allCategoryList.length > 6 && (
                        <div className="view-toggle">
                          {visibleCategoryCount < allCategoryList.length ? (
                            <Button
                              onClick={handleViewMoreCategories}
                              className="view-more-btn"
                            >
                              View More <MdKeyboardArrowDown size={20} />
                            </Button>
                          ) : (
                            <Button
                              onClick={handleViewLessCategories}
                              className="view-more-btn"
                            >
                              View Less <MdKeyboardArrowUp size={20} />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted">No categories found</p>
                  )}
                </div>

                {/* Sort Options */}
                <div className="filter-section">
                  <h4>Sort By</h4>
                  <select
                    className="form-control"
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split("-");
                      setSortBy(field);
                      setSortOrder(order);
                      setPage(1);
                    }}
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                  </select>
                </div>

                {/* Top Rated Products */}
                <div className="filter-section">
                  <h4>Top Rated Products</h4>
                  {topRatedProducts.map((product) => (
                    <div key={product.id} className="top-rated-item">
                      <Row className="align-items-center">
                        <Col xs={4}>
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="top-rated-img"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/Images/placeholder.jpg";
                            }}
                          />
                        </Col>
                        <Col xs={8}>
                          <div className="top-rated-info">
                            <div className="rating-stars">
                              {renderStars(product.rating)}
                              <span className="rating-text">(5.0)</span>
                            </div>
                            <strong className="product-name">
                              {product.name}
                            </strong>
                            <p className="product-price">₹{product.price}</p>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>

                {/* Reset Filter */}
                <div className="filter-section">
                  <h4>Reset Filters</h4>
                  <Button
                    style={{ background: "#E9272D", border: "none" }}
                    onClick={resetFilters}
                    className="w-100"
                  >
                    Reset All Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="col-md-9">
              <div className="product-list-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="product-count">
                    <span>
                      Showing {products.length > 0 ? start : 0}–{end} of{" "}
                      {totalCount} results
                    </span>
                  </div>
                </div>
              </div>

              <div className="products-container">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="no-products-found text-center py-5">
                    <h3>No products found</h3>
                    <p className="text-muted">
                      Try adjusting your search criteria or filters
                    </p>
                    <Button onClick={resetFilters} className="btn btn-primary">
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <Row>
                    {products.map((product) => (
                      <Col
                        key={product._id}
                        lg={4}
                        md={6}
                        sm={12}
                        className="mb-4"
                      >
                        <Card className="product-card h-100">
                          <div className="product-image-container">
                            <Card.Img
                              variant="top"
                              src={getProductImage(product)}
                              alt={getProductName(product)}
                              className="product-img"
                              onClick={() => handleViewProduct(product._id)}
                              onError={(e) => {
                                console.log(
                                  "Image failed to load:",
                                  e.target.src
                                );
                                e.target.onerror = null;
                                e.target.src = "/Images/placeholder.jpg";
                              }}
                            />
                            <FaHeart className="heart-icon" />
                            {inCartStatus[product._id] === true && (
                              <Badge
                                className="added-to-cart-badge"
                                bg="success"
                              >
                                In Cart
                              </Badge>
                            )}
                          </div>
                          <Card.Body className="d-flex flex-column">
                            <div className="product-info flex-grow-1">
                              {/* Product details */}
                              {/* <Card.Text className="product-details">
                                {product.weight && (
                                  <span>• {product.weight}g </span>
                                )}
                                {product.no_of_pieces && (
                                  <span>• {product.no_of_pieces} Pieces </span>
                                )}
                                {product.serves && (
                                  <span>• Serves {product.serves}</span>
                                )}
                              </Card.Text> */}

                              <Card.Title className="product-name">
                                {getProductName(product)}
                              </Card.Title>

                              <Card.Text className="product-description">
                                {truncateText(
                                  product.description ||
                                    product.product_description,
                                  100
                                )}
                              </Card.Text>

                              <div className="price-section">
                                <div className="price-info">
                                  <span className="current-price">
                                    ₹{getProductPrice(product)}
                                  </span>
                                  <span className="original-price">
                                    ₹
                                    {discountAmount(
                                      getProductPrice(product),
                                      23
                                    )}
                                  </span>
                                </div>
                                <div className="discount-info">
                                  <span className="discount-badge">
                                    23% Off
                                  </span>
                                </div>
                              </div>

                              <div className="product-rating">
                                {renderStars(5)}
                                <span className="rating-count">(5.0)</span>
                              </div>
                            </div>

                            <div className="product-actions mt-auto">
                              <Button
                                variant="outline-primary"
                                onClick={() => handleViewProduct(product._id)}
                                className="view-details-btn"
                              >
                                View Details
                              </Button>
                              {inCartStatus[product._id] === true ? (
                                <Button
                                  variant="success"
                                  onClick={() => handleRemoveFromCart(product)}
                                  className="remove-from-cart-btn"
                                >
                                  Remove from Cart
                                </Button>
                              ) : (
                                <Button
                                  variant="primary"
                                  onClick={() => handleAddToCart(product)}
                                  disabled={
                                    inCartStatus[product._id] === "loading"
                                  }
                                  className="add-to-cart-btn"
                                >
                                  {inCartStatus[product._id] === "loading"
                                    ? "Adding..."
                                    : "Add to Cart"}
                                </Button>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>

              {/* Pagination */}
              {pagesCount > 1 && (
                <div className="pagination-container text-center mt-4">
                  <Stack spacing={2}>
                    <Pagination
                      count={pagesCount}
                      page={page}
                      onChange={handlePageChange}
                      variant="outlined"
                      shape="rounded"
                      color="primary"
                    />
                  </Stack>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Shop;
