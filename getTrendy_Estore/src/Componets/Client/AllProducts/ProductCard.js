"use client"

import { useEffect, useState } from "react"
import { Card, Button, Badge, Col, Row, Container } from "react-bootstrap"
import { FaHeart } from "react-icons/fa"
import "./ProductCard.css"
import axios from "axios"
import { BASEURL, getImageUrl } from "../Comman/CommanConstans"
import Loader from "../Loader/Loader"
import { useNavigate } from "react-router-dom"
import { useCart } from "../../CartContext/CartContext"
import { useAuth } from "../../AuthContext/AuthContext"
import { Pagination, Stack } from "@mui/material"

const ProductCard = () => {
  const { userToken } = useAuth()
  const { addToCart } = useCart()
  const navigation = useNavigate()
  const [inCart, setInCart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagesCountAll, setPagesCountAll] = useState(1)
  const [inCartStatus, setInCartStatus] = useState({})
  const [pageAll, setPageAll] = useState(1)
  const [limitAll, setLimitAll] = useState(8)
  const [error, setError] = useState(null)

  const handleAddToCart = (product) => {
    if (userToken) {
      addToCart(product, 1)
      setInCartStatus((prevStatus) => ({
        ...prevStatus,
        [product.id || product._id]: true,
      }))
    } else {
      navigation("/login")
      window.scroll(0, 0)
    }
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const getAllProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching products from:", `${BASEURL}/api/products?page=${pageAll}&limit=${limitAll}`)
      const response = await axios.get(`${BASEURL}/api/products?page=${pageAll}&limit=${limitAll}`)
      setLoading(false)

      // Log the entire response to see its structure
      console.log("API Response:", response)

      if (response && response.data) {
        // Check if response.data has rows property
        if (response.data.rows) {
          console.log("Products found:", response.data.rows)
          setAllProducts(response.data.rows)
          setPagesCountAll(response.data.pages_count || 1)
        }
        // Check if response.data is the array directly
        else if (Array.isArray(response.data)) {
          console.log("Products found (array):", response.data)
          setAllProducts(response.data)
          setPagesCountAll(Math.ceil(response.data.length / limitAll) || 1)
        }
        // Check if response has products property
        else if (response.data.products) {
          console.log("Products found (products property):", response.data.products)
          setAllProducts(response.data.products)
          setPagesCountAll(response.data.pages_count || 1)
        }
        // If none of the above, try to use the response directly
        else if (response.products) {
          console.log("Products found (response.products):", response.products)
          setAllProducts(response.products)
          setPagesCountAll(response.pages_count || 1)
        }
        // If we still don't have products, log an error
        else {
          console.error("No products found in response:", response)
          setError("No products found in API response")
        }
      } else {
        console.error("Invalid response:", response)
        setError("Invalid API response")
      }
    } catch (error) {
      setLoading(false)
      console.error("Error fetching products:", error)
      setError(error.message || "Error fetching products")
    }
  }

  const truncateText = (text, limit) => {
    if (!text) return ""
    return text.length > limit ? text.slice(0, limit) + "..." : text
  }

  const navigateToProduct = (id) => {
    navigation("/perticularproductpage", { state: { productId: id } })
    window.scroll(0, 0)
  }

  const navigateToShop = () => {
    window.scroll(0, 0)
    navigation("/shop")
  }

  const handlePageChange = (event, value) => {
    setPageAll(value)
  }

  const renderPaginationCount = () => {
    return pagesCountAll
  }

  const discountAmount = (price, rate) => {
    if (!price) return 0
    const amount = (price * rate) / 100
    const originalPrice = price + amount
    return originalPrice.toFixed(2)
  }

  useEffect(() => {
    getAllProducts()
  }, [pageAll, limitAll])

  return (
    <>
      {loading ? <Loader /> : ""}
      <div>
        <Container className="main-container">
          <div
            data-aos="fade-down"
            data-aos-duration="2000"
            data-aos-easing="ease-in-out"
            className="section-title mb-3"
          >
            <div className="section-line"></div>
            <div className="text-center">
              <h5>All Product Shop</h5>
              <h1>Products</h1>
            </div>
            <div className="section-line"></div>
          </div>

          {/* Display error message if there is one */}
          {error && <div className="alert alert-danger text-center mb-4">Error: {error}</div>}

          <Row className="">
            {allProducts && allProducts.length > 0 ? (
              allProducts.map((product) => (
                <Col
                  lg={3}
                  md={6}
                  sm={6}
                  key={product.id || product._id}
                  className="mb-5 d-flex justify-content-center"
                >
                  <Card className="costume-product-card" onClick={() => navigateToProduct(product.id || product._id)}>
                    <div className="product-image-container">
                      <Card.Img
                        variant="top"
                        src={getImageUrl(
                          product.product_image ||
                            (product.images && product.images.length > 0 ? product.images[0] : null),
                        )}
                        alt={product.product_name}
                        className="particular-product-image"
                        onError={(e) => {
                          console.log("Image error:", e)
                          e.target.src = "/placeholder.svg"
                        }}
                      />
                      <FaHeart className="heart-icon" />
                      {inCartStatus[product.id || product._id] && (
                        <Badge className="added-to-cart-badge" bg="success">
                          Added to cart
                        </Badge>
                      )}
                    </div>
                    <Card.Body>
                      <Card.Title className="product-title">{product.product_name}</Card.Title>
                      <Card.Text className="product-description">
                        {truncateText(product.description || product.product_description, 100)}
                      </Card.Text>
                      <div className="price-section">
                        <div>
                          <span className="price">
                            ₹
                            {product.discount_price && product.discount_price < product.price
                              ? product.discount_price
                              : product.price}
                            .00
                          </span>
                          {product.discount_price && product.discount_price < product.price && (
                            <span className="original-price">₹{product.price}.00</span>
                          )}
                          {!product.discount_price && (
                            <span className="original-price">₹{discountAmount(product.price, 23)}</span>
                          )}
                        </div>
                        <div>
                          <span className="discount">
                            {product.discount_price && product.discount_price < product.price
                              ? Math.round(((product.price - product.discount_price) / product.price) * 100)
                              : 23}
                            % Off
                          </span>
                        </div>
                      </div>
                      <div className="button-section">
                        <Button
                          variant="outline-dark"
                          className="view-more-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigateToProduct(product.id || product._id)
                          }}
                        >
                          View More
                        </Button>
                        <Button
                          className="add-to-cart-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(product)
                          }}
                        >
                          Add to cart
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <div className="text-center mb-5">
                <h4>No Products Found</h4>
                <p>Please check the API connection or try again later.</p>
              </div>
            )}

            {allProducts && allProducts.length > 0 && (
              <div className="text-center mb-3">
                <Stack spacing={2}>
                  <Pagination
                    count={pagesCountAll}
                    page={pageAll}
                    variant="outlined"
                    shape="rounded"
                    onChange={handlePageChange}
                  />
                </Stack>
              </div>
            )}

            <div className="text-center mb-3 mt-2">
              <Button className="button" onClick={() => navigateToShop()}>
                Show All
              </Button>
            </div>
          </Row>
        </Container>
      </div>
    </>
  )
}

export default ProductCard
