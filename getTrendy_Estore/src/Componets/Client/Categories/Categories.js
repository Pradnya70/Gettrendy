import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASEURL } from "../Comman/CommanConstans";
import Loader from "../Loader/Loader";
import "./Categories.css";
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
      const response = await axios.get(`${BASEURL}/api/category?limit=6`); // Limit to 6 categories for display

      if (response && response.data) {
        setCategories(response.data.rows || []);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  // Navigate to shop with selected category
  const navigateToCategory = (categoryId) => {
    navigate("/shop", { state: { categoryId } });
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <>
      {loading && <Loader />}
      <Container fluid className="categories-container my-5">
        <Row>
          {categories.length > 0 ? (
            categories.map((category) => (
              <Col
                lg={2}
                md={4}
                sm={6}
                key={category.id}
                className="mb-4"
                style={{ padding: "0px" }}
              >
                <Card
                  className="category-card"
                  onClick={() => navigateToCategory(category.id)}
                  style={{ margin: "0px", boxShadow: "none" }}
                >
                  <div className="category-image-container">
                    <Card.Img
                      variant="top"
                      src={BASEURL + category.category_image}
                      alt={category.category_name}
                      className="category-image"
                    />
                  </div>
                  <Card.Body className="text-center">
                    <Card.Title>{category.category_name}</Card.Title>
                    {/* <Card.Text className="text-muted">
                      {category.category_description}
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
