import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASEURL } from "../Comman/CommanConstans";
import Loader from "../Loader/Loader";
import "./Subcategory.css";
import Aos from "aos";
import "aos/dist/aos.css";

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASEURL}/api/Subcategory?limit=6`); // Limit to 6 categories for display

      if (response && response.data) {
        setCategories(response.data.rows || []);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  // Navigate to shop with selected Subcategory
  const navigateToSubcategory = (SubcategoriesId) => {
    navigate("/shop", { state: { SubcategoriesId } });
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <>
      {loading && <Loader />}
      <Container fluid className="categories-container my-5">
        <div
          data-aos="fade-down"
          data-aos-duration="2000"
          data-aos-easing="ease-in-out"
          className="section-title mb-3"
        >
          <div className="section-line"></div>
          <div className="text-center">
            <h5>All Product Shop</h5>
            <h1>Fandom Products</h1>
          </div>
          <div className="section-line"></div>
        </div>
        <Row>
          {categories.length > 0 ? (
            categories.map((Subcategories) => (
              <Col
                lg={3}
                md={4}
                sm={6}
                key={Subcategories.id}
                className="mb-4"
                style={{}}
              >
                <Card
                  className="Subcategory-card"
                  onClick={() => navigateToSubcategory(Subcategories.id)}
                  style={{}}
                >
                  <div className="Subcategory-image-container">
                    <Card.Img
                      variant="top"
                      src={BASEURL + Subcategories.subcategory_image}
                      alt={Subcategories.subcategory_name}
                      className="Subcategory-image"
                    />
                  </div>
                  <Card.Body className="text-center">
                    <Card.Title>{Subcategories.subcategory_name}</Card.Title>
                    {/* <Card.Text className="text-muted">
                      {Subcategory.Subcategory_description}
                    </Card.Text> */}
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col xs={12} className="text-center">
              <h4>No categories found</h4>
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
};

export default Categories;
