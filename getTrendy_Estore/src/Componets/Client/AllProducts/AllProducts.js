// import React, { useEffect, useState } from "react";
// import { FaShoppingCart, FaRegHeart, FaEye } from "react-icons/fa";
// import "./AllProducts.css";
// import { Row, Col, Nav, Button } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { BASEURL } from "../Comman/CommanConstans";
// import { Pagination, Stack } from "@mui/material";
// import Loader from "../Loader/Loader";
// import { useAuth } from "../../AuthContext/AuthContext";
// import { ToastContainer, toast, Bounce } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useCart } from "../../CartContext/CartContext";
// import { faUtensils, faWeightHanging } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// const AllProducts = () => {
//   const { userToken } = useAuth();
//   const { addToCart } = useCart();
//   const navigation = useNavigate();
//   const [allProducts, setAllProducts] = useState([]);
//   const [chickenProducts, setChickenProducts] = useState([]);
//   const [muttonProducts, setMuttonProducts] = useState([]);
//   const [seafoodProducts, setSeafoodProducts] = useState([]);

//   const [pageAll, setPageAll] = useState(1);
//   const [pageChicken, setPageChicken] = useState(1);
//   const [pageMutton, setPageMutton] = useState(1);
//   const [pageSeafood, setPageSeafood] = useState(1);

//   const [limitAll, setLimitAll] = useState(8);
//   const [limitChicken, setLimitChicken] = useState(8);
//   const [limitMutton, setLimitMutton] = useState(8);
//   const [limitSeafood, setLimitSeafood] = useState(8);

//   const [pagesCountAll, setPagesCountAll] = useState(1);
//   const [pagesCountChicken, setPagesCountChicken] = useState(1);
//   const [pagesCountMutton, setPagesCountMutton] = useState(1);
//   const [pagesCountSeafood, setPagesCountSeafood] = useState(1);
//   const [allCategories, setAllCategories] = useState([]);

//   const [loading, setLoading] = useState(false);

//   const [activeTab, setActiveTab] = useState("allProducts");

//   const filteredProducts =
//     activeTab === "allProducts"
//       ? allProducts
//       : allProducts.filter(
//           (product) => product.sub_category_name === activeTab
//         );

//   const navigateToShop = () => {
//     window.scroll(0, 0);
//     navigation("/shop");
//   };

//   const getAllProducts = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${BASEURL}/api/products?page=${pageAll}&limit=${limitAll}`
//       );
//       setLoading(false);
//       if (response) {
       
//         console.log("All Products",response.data);
//         setAllProducts(response.data);
//         setPagesCountAll(response.data.pages_count); // Set pagination for all products
//       }
//     } catch (error) {
//       setLoading(false);
//       console.log(error);
//     }
//   };

//   const getChickenProducts = async (id) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${BASEURL}/api/products?page=${pageChicken}&limit=${limitChicken}`
//       );
//       setLoading(false);
//       if (response) {
//         setChickenProducts(response.data.rows);
//         setPagesCountChicken(response.data.pages_count);
//       }
//     } catch (error) {
//       setLoading(false);
//       console.log(error);
//     }
//   };

//   const getMuttonProducts = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${BASEURL}/customers/all-products?page=${pageMutton}&limit=${limitMutton}&sub_category=819322ba-f5a3-489b-856f-44bc65ad7013`
//       );
//       setLoading(false);
//       if (response) {
//         setMuttonProducts(response.data.rows);
//         setPagesCountMutton(response.data.pages_count); // Set pagination for mutton products
//       }
//     } catch (error) {
//       setLoading(false);
//       console.log(error);
//     }
//   };

//   const getSeafoodProducts = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${BASEURL}/customers/all-products?page=${pageSeafood}&limit=${limitSeafood}&sub_category=27019ee6-c0b2-4a2c-9382-0e7c8061063a`
//       );
//       setLoading(false);
//       if (response) {
//         setSeafoodProducts(response.data.rows);
//         setPagesCountSeafood(response.data.pages_count); // Set pagination for seafood products
//       }
//     } catch (error) {
//       setLoading(false);
//       console.log(error);
//     }
//   };

//   const handlePageChange = (event, value) => {
//     if (activeTab === "allProducts") {
//       setPageAll(value);
//       getAllProducts();
//     } else {
//       setPageAll(value); // Update the page number for the current sub-category
//       getProductsBySubCategory(activeTab); // Fetch products for the active sub-category
//     }
//   };

//   const handleTabSelect = (name, id) => {
//     setActiveTab(name);

//     if (name === "allProducts") {
//       getAllProducts();
//     } else {
//       getProductsBySubCategory(id);
//     }
//   };

//   const getProductsBySubCategory = async (id) => {
//     try {
//       setLoading(true);
//       console.log(id);
//       const response = await axios.get(
//         `${BASEURL}/api/products?page=${pageAll}&limit=${limitAll}`
//       );
//       setLoading(false);
//       if (response) {
//         setAllProducts(response.data.rows); // Assuming you want to show products in the same state
//         setPageAll(response.data.pages_count); // Update pagination count
//       }
//     } catch (error) {
//       setLoading(false);
//       console.log(error);
//     }
//   };

//   const renderPaginationCount = () => {
//     if (activeTab === "allProducts") {
//       return pagesCountAll;
//     } else if (activeTab === "Chicken") {
//       return pagesCountChicken;
//     } else if (activeTab === "Mutton") {
//       return pagesCountMutton;
//     } else if (activeTab === "SeeFood") {
//       return pagesCountSeafood;
//     }
//   };

//   const getAllCategories = async () => {
//     try {
//       const response = await axios.get(
//         `${BASEURL}/api/products?page=1&limit=10`
//       );
//       if (response) {
//         setAllCategories(response.data.rows);
//       }
//       setLoading(false);
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   const navigateToProduct = (id) => {
//     navigation("/perticularproductpage", { state: { productId: id } });
//     window.scroll(0, 0);
//   };

//   const handleAddToCart = (product) => {
//     if (userToken) {
//       addToCart(product, 1);
//     } else {
//       navigation("/login");
//       window.scroll(0, 0);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "allProducts") {
//       getAllProducts();
//     } else if (activeTab === "Chicken") {
//       // getChickenProducts();
//     } else if (activeTab === "Mutton") {
//       getMuttonProducts();
//     } else if (activeTab === "SeeFood") {
//       getSeafoodProducts();
//     }
//     getAllCategories();
//   }, [pageAll, pageChicken, pageMutton, pageSeafood, activeTab]);
//   return (
//     <>
//       {loading ? <Loader /> : ""}
//       <div className="product-container">
//         <div
//           data-aos="fade-down"
//           data-aos-duration="2000"
//           data-aos-easing="ease-in-out"
//           className="section-title"
//         >
//           <div className="section-line"></div>
//           <div className="text-center">
//             <h5>All Product Shop</h5>
//             <h1>Featured Products</h1>
//           </div>

//           <div className="section-line"></div>
//         </div>
//         <div className="header">
//           <Nav variant="tabs" activeKey={activeTab}>
//             <Nav.Item>
//               <Nav.Link
//                 onClick={() => handleTabSelect("allProducts", null)}
//                 eventKey="allProducts"
//               >
//                 All Products
//               </Nav.Link>
//             </Nav.Item>
//             {/* {allCategories &&
//             allCategories.map((row) => (
//                 <Nav.Item key={row.id}>
//                     <Nav.Link
//                         onClick={() => handleTabSelect(row.name, row.id)}
//                         eventKey={row.name} // Set eventKey to category name
//                     >
//                         {row.name}
//                     </Nav.Link>
//                 </Nav.Item>
//             ))} */}
//           </Nav>
//           <div>
//             <input
//               type="search"
//               placeholder="Search for any delicious product"
//             />
//           </div>
//         </div>

//         <Row className="product-cards">
//           {allProducts && allProducts?.length > 0 ? (
//             allProducts.map((product) => (
//               <Col lg={3} md={6} sm={12} key={product.id} className="mb-5">
//                 <div className="card">
//                   <div
//                     className="image-container"
//                     onClick={() => navigateToProduct(product.id)}
//                   >
//                     <img
//                       src={BASEURL + product.product_image}
//                       alt={product.product_name}
//                     />
//                   </div>
//                   <div
//                     className="card-info mb-3"
//                     onClick={() => navigateToProduct(product.id)}
//                   >
//                     <h5 className="mb-3">{product.product_name}</h5>
//                     <div className="mb-3">
//                       {product.no_of_pices ? (
//                         <span>
//                           <FontAwesomeIcon icon={faUtensils} /> &nbsp;
//                           {product.no_of_pices} Pieces
//                         </span>
//                       ) : (
//                         ""
//                       )}{" "}
//                       &nbsp;&nbsp;
//                       {product.weight ? (
//                         <span>
//                           <FontAwesomeIcon icon={faWeightHanging} /> &nbsp;
//                           {product.weight} g
//                         </span>
//                       ) : (
//                         ""
//                       )}
//                     </div>

//                     <p style={{ fontWeight: "bold" }}>₹{product.price}</p>
//                   </div>
//                   <div className="card-icons">
//                     <FaShoppingCart
//                       className="icon"
//                       onClick={() => handleAddToCart(product)}
//                       title="Add To Cart"
//                     />
//                     <FaRegHeart className="icon" title="Add To Wishlist" />
//                     <FaEye
//                       className="icon"
//                       title="Quick View"
//                       onClick={() => navigateToProduct(product.id)}
//                     />
//                   </div>
//                 </div>
//               </Col>
//             ))
//           ) : (
//             <div className="text-center mb-5">
//               <h4>No Data Found</h4>
//             </div>
//           )}

//           <div className="display-start mb-5">
//             <Stack spacing={2}>
//               <Pagination
//                 count={renderPaginationCount()}
//                 page={pageAll}
//                 variant="outlined"
//                 shape="rounded"
//                 onChange={handlePageChange}
//               />
//             </Stack>
//           </div>
//           <div className="text-center">
//             <Button className="button" onClick={() => navigateToShop()}>
//               Shop Now
//             </Button>
//           </div>
//         </Row>
//       </div>
//       <ToastContainer
//         position="top-center"
//         autoClose={4000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//         transition={Bounce}
//       />
//     </>
//   );
// };

// export default AllProducts;


"use client"

import { useState, useEffect } from "react"
import { Row, Col, Button, Card, Container, Form, InputGroup } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { BASEURL } from "../Comman/CommanConstans"
import { Pagination, Stack } from "@mui/material"
import Loader from "../Loader/Loader"
import { useAuth } from "../../AuthContext/AuthContext"
import { useCart } from "../../CartContext/CartContext"
import { FaShoppingCart, FaRegHeart, FaEye, FaSearch } from "react-icons/fa"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilter } from "@fortawesome/free-solid-svg-icons"

const Allproducts = () => {
  const { userToken } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(8)
  const [totalPages, setTotalPages] = useState(1)
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    size: "",
    color: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [availableSizes, setAvailableSizes] = useState([])
  const [availableColors, setAvailableColors] = useState([])

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true)

      // Build query string with filters
      let queryParams = `page=${page}&limit=${limit}`
      if (filters.category) queryParams += `&category=${filters.category}`
      if (filters.minPrice) queryParams += `&minPrice=${filters.minPrice}`
      if (filters.maxPrice) queryParams += `&maxPrice=${filters.maxPrice}`
      if (filters.size) queryParams += `&size=${filters.size}`
      if (filters.color) queryParams += `&color=${filters.color}`
      if (searchTerm) queryParams += `&search=${searchTerm}`

      const response = await axios.get(`${BASEURL}/api/products?${queryParams}`)

      if (response && response.data) {
        setProducts(response.data.rows || [])
        setTotalPages(response.data.pages_count || 1)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching products:", error)
      setLoading(false)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASEURL}/api/category?limit=100`)
      if (response && response.data) {
        setCategories(response.data.rows || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  // Fetch product filters (sizes, colors)
  const fetchProductFilters = async () => {
    try {
      const response = await axios.get(`${BASEURL}/api/products/filters`)
      if (response && response.data && response.data.data) {
        setAvailableSizes(response.data.data.sizes || [])
        setAvailableColors(response.data.data.colors || [])
      }
    } catch (error) {
      console.error("Error fetching product filters:", error)
    }
  }

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value)
  }

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId)
    setFilters({
      ...filters,
      category: categoryId === "all" ? "" : categoryId,
    })
    setPage(1) // Reset to first page when changing category
  }

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  // Apply filters
  const applyFilters = () => {
    setPage(1) // Reset to first page when applying filters
    fetchProducts()
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: activeCategory === "all" ? "" : activeCategory,
      minPrice: "",
      maxPrice: "",
      size: "",
      color: "",
    })
    setSearchTerm("")
    setPage(1)
  }

  // Navigate to product detail
  const navigateToProduct = (id) => {
    navigate("/perticularproductpage", { state: { productId: id } })
    window.scrollTo(0, 0)
  }

  // Add to cart
  const handleAddToCart = (product) => {
    if (userToken) {
      addToCart(product, 1)
    } else {
      navigate("/login")
      window.scrollTo(0, 0)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchCategories()
    fetchProductFilters()
  }, [])

  // Fetch products when page, filters, or search changes
  useEffect(() => {
    fetchProducts()
  }, [page, activeCategory])

  return (
    <Container className="py-5">
      {loading && <Loader />}

      <div className="mb-5 text-center">
        <h2 className="mb-4">Our Products</h2>
        <p className="text-muted">Discover our collection of high-quality products</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <InputGroup className="w-50">
          <Form.Control
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary" onClick={applyFilters}>
            <FaSearch />
          </Button>
        </InputGroup>

        <Button
          variant="outline-secondary"
          onClick={() => setShowFilters(!showFilters)}
          className="d-flex align-items-center gap-2"
        >
          <FontAwesomeIcon icon={faFilter} />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Price Range</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="number"
                      placeholder="Min"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                    />
                    <Form.Control
                      type="number"
                      placeholder="Max"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Size</Form.Label>
                  <Form.Select name="size" value={filters.size} onChange={handleFilterChange}>
                    <option value="">All Sizes</option>
                    {availableSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <Form.Select name="color" value={filters.color} onChange={handleFilterChange}>
                    <option value="">All Colors</option>
                    {availableColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <div className="d-flex gap-2 mb-3 w-100">
                  <Button variant="primary" onClick={applyFilters} className="flex-grow-1">
                    Apply Filters
                  </Button>
                  <Button variant="outline-secondary" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Categories */}
      <div className="mb-4">
        <div className="d-flex flex-wrap gap-2">
          <Button
            variant={activeCategory === "all" ? "primary" : "outline-primary"}
            onClick={() => handleCategoryChange("all")}
            className="mb-2"
          >
            All Products
          </Button>

          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "primary" : "outline-primary"}
              onClick={() => handleCategoryChange(category.id)}
              className="mb-2"
            >
              {category.category_name}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <Row>
          {products.map((product) => (
            <Col lg={3} md={4} sm={6} key={product.id} className="mb-4">
              <Card className="h-100 product-card">
                <div className="product-image-container" onClick={() => navigateToProduct(product.id)}>
                  <Card.Img
                    variant="top"
                    src={BASEURL + product.images[0]}
                    alt={product.product_name}
                    className="product-image"
                  />
                </div>

                <Card.Body className="d-flex flex-column">
                  <Card.Title className="product-title" onClick={() => navigateToProduct(product.id)}>
                    {product.product_name}
                  </Card.Title>

                  <div className="product-details mb-3">
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="mb-1">
                        <small className="text-muted">Sizes: {product.sizes.join(", ")}</small>
                      </div>
                    )}

                    {product.colors && product.colors.length > 0 && (
                      <div>
                        <small className="text-muted">Colors: {product.colors.join(", ")}</small>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="product-price">
                        <span className="fw-bold">${product.price.toFixed(2)}</span>
                        {product.discount_price && product.discount_price < product.price && (
                          <span className="text-muted text-decoration-line-through ms-2">
                            ${product.discount_price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="product-stock">
                        <small className={`badge ${product.stock > 0 ? "bg-success" : "bg-danger"}`}>
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </small>
                      </div>
                    </div>

                    <div className="product-actions d-flex gap-2">
                      <Button
                        variant="primary"
                        className="flex-grow-1"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                      >
                        <FaShoppingCart className="me-2" />
                        Add to Cart
                      </Button>

                      <Button variant="outline-secondary" onClick={() => navigateToProduct(product.id)}>
                        <FaEye />
                      </Button>

                      <Button variant="outline-danger">
                        <FaRegHeart />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <h4>No products found</h4>
          <p className="text-muted">Try adjusting your filters or search criteria</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              color="primary"
            />
          </Stack>
        </div>
      )}
    </Container>
  )
}

export default Allproducts

