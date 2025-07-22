"use client"

import { useEffect, useState } from "react"
import { Container, Row, Col, Card } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { BASEURL, getImageUrl } from "../Comman/CommanConstans"
import Loader from "../Loader/Loader"
import "./Subcategory.css"
import Aos from "aos"
import "aos/dist/aos.css"

const Categories = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch all subcategories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      console.log("Fetching subcategories from:", `${BASEURL}/api/subcategory?limit=6`)

      const response = await axios.get(`${BASEURL}/api/subcategory?limit=6`) // Fixed: lowercase 'subcategory'

      console.log("Subcategories API response:", response.data)

      if (response && response.data) {
        // Handle different response formats
        const subcategoriesData = response.data.rows || response.data.data || response.data || []
        console.log("Subcategories data:", subcategoriesData)
        setCategories(subcategoriesData)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching subcategories:", error)
      setLoading(false)
    }
  }

  // Navigate to shop with selected subcategory
  const navigateToSubcategory = (subcategoryId) => {
    console.log("Navigating to subcategory:", subcategoryId)
    navigate("/shop", { state: { subcategoryId } })
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    fetchCategories()
    // Initialize AOS
    Aos.init()
  }, [])

  return (
    <>
      {loading && <Loader />}
      <Container fluid className="categories-container my-5">
        <div data-aos="fade-down" data-aos-duration="2000" data-aos-easing="ease-in-out" className="section-title mb-3">
          <div className="section-line"></div>
          <div className="text-center">
            <h5>All Product Shop</h5>
            <h1>Fandom Products</h1>
          </div>
          <div className="section-line"></div>
        </div>
        <Row>
          {categories.length > 0 ? (
            categories.map((subcategory) => (
              <Col
                lg={3}
                md={4}
                sm={6}
                key={subcategory._id || subcategory.id} // Fixed: use _id for MongoDB
                className="mb-4"
              >
                <Card
                  className="Subcategory-card"
                  onClick={() => navigateToSubcategory(subcategory._id || subcategory.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="Subcategory-image-container">
                    <Card.Img
                      variant="top"
                      src={
                        getImageUrl(subcategory.subcategory_logo || subcategory.subcategory_image) || "/placeholder.svg"
                      } // Fixed: use getImageUrl helper and correct field name
                      alt={subcategory.subcategory_name}
                      className="Subcategory-image"
                      onError={(e) => {
                        console.error("Image load error for subcategory:", subcategory.subcategory_name)
                        console.error("Image URL:", e.target.src)
                        e.target.onerror = null
                        e.target.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                  <Card.Body className="text-center">
                    <Card.Title>{subcategory.subcategory_name}</Card.Title>
                    {/* {subcategory.subcategory_description && (
                      <Card.Text className="text-muted">{subcategory.subcategory_description}</Card.Text>
                    )} */}
                    {/* Display parent category if available */}
                    {/* {subcategory.parent_category && (
                      <Card.Text className="text-muted small">
                        Category: {subcategory.parent_category.category_name || subcategory.parent_category}
                      </Card.Text>
                    )} */}
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12} className="text-center">
              <h4>No subcategories found</h4>
              <p className="text-muted">Please check your API connection or try again later.</p>
            </Col>
          )}
        </Row>
      </Container>
    </>
  )
}

export default Categories
