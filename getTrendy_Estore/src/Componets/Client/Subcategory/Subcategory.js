"use client"

import { useEffect, useState } from "react"
import { Container, Card } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { BASEURL, getImageUrl } from "../Comman/CommanConstans"
import Loader from "../Loader/Loader"
import "./Subcategory.css"
import Aos from "aos"
import "aos/dist/aos.css"

// 👇 Import Swiper
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"

const Categories = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${BASEURL}/api/subcategory?limit=6`)
      const subcategoriesData = response.data.rows || response.data.data || response.data || []
      setCategories(subcategoriesData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching subcategories:", error)
      setLoading(false)
    }
  }

  const navigateToSubcategory = (subcategoryId) => {
    navigate("/shop", { state: { subcategoryId } })
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    fetchCategories()
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

        {categories.length > 0 ? (
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation={true} // 👈 prev/next buttons
            autoplay={{ delay: 2000, disableOnInteraction: false }} // 👈 auto-slide every 2 sec
            loop={true} // 👈 infinite loop
            spaceBetween={20}
            slidesPerView={4}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
          >
            {categories.map((subcategory) => (
              <SwiperSlide key={subcategory._id || subcategory.id}>
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
                      }
                      alt={subcategory.subcategory_name}
                      className="Subcategory-image"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center">
            <h4>No subcategories found</h4>
            <p className="text-muted">Please check your API connection or try again later.</p>
          </div>
        )}
      </Container>
    </>
  )
}

export default Categories
