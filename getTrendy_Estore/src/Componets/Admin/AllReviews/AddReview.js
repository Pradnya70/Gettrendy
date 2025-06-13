import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { BASEURL } from "../../Client/Comman/CommanConstans";
import { useAuth } from "../../AuthContext/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../Client/Loader/Loader";

const AddReview = () => {
  const { userToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    image: null,
    description: "",
    ratings: "",
    designation: "",
    product: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [reviewId, setReviewId] = useState(null);
  const [originalData, setOriginalData] = useState({
    name: "",
    image: null,
    description: "",
    ratings: "",
    designation: "",
    product: "",
  });
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/api/products?page=${1}&limit=${200}`
      );
      if (response) {
        setLoading(false);
        setAllProducts(response.data.rows);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleBack = () => {
    window.history.back();
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value, // Handle file input
    }));
    if (files) {
      const file = e?.target?.files[0];
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    let errors = {};
    if (!formData.name) errors.name = "Name is required";

    if (!formData.description) errors.description = "Description is required";

    if (!formData.ratings) errors.categoryname = "Ratings is required";

    if (!formData.designation) errors.designation = "Designation is required";

    setErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setMessage("Please fill out all fields");
      return;
    }
    if (reviewId) {
      const formDataToSend = new FormData();

      if (originalData.name !== formData.name) {
        formDataToSend.append("name", formData.name);
      }
      if (originalData.product !== formData.product) {
        formDataToSend.append("product", formData.product);
      }
      if (originalData.description !== formData.description) {
        formDataToSend.append("description", formData.description);
      }
      if (originalData.ratings !== formData.ratings) {
        formDataToSend.append("rating", formData.ratings);
      }
      if (originalData.designation !== formData.designation) {
        formDataToSend.append("email", formData.designation);
      }

      try {
        const response = await axios.put(
          `${BASEURL}/products/review/${reviewId}`,
          formDataToSend,
          {
            headers: {
              "x-access-token": userToken,
            },
          }
        );
        if (response.data) {
          navigate("/admin-reviews");
        }
        setMessage("Review added successfully");
      } catch (error) {
        setMessage("Failed to add Review");
        console.error(error);
      }
    } else {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("rating", formData.ratings);
      formDataToSend.append("email", formData.designation);
      formDataToSend.append("product", formData.product);

      try {
        const response = await axios.post(
          `${BASEURL}/products/review`,
          formDataToSend,
          {
            headers: {
              "x-access-token": userToken,
            },
          }
        );
        if (response.data) {
          navigate("/admin-reviews");
        }
        setMessage("Review added successfully");
      } catch (error) {
        setMessage("Failed to add Review");
        console.error(error);
      }
    }
  };

  const getReviewsById = async (id) => {
    try {
      const headers = {
        "x-access-token": userToken,
      };
      setLoading(true);
      const response = await axios.get(`${BASEURL}/products/review/${id}`, {
        headers,
      });
      if (response) {
        setLoading(false);
        const data = response.data.data;
        setFormData({
          name: data.name,
          ratings: data.rating,
          description: data.description,
          designation: data.email,
          product: data.product,
        });
        setSelectedImage(BASEURL + data.image);
        setOriginalData({
          name: data.name,
          ratings: data.rating,
          description: data.description,
          designation: data.email,
          product: data.product,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const reviewId = location?.state?.reviewID;
    if (reviewId) {
      getReviewsById(reviewId);
      setReviewId(reviewId);
    }
    getAllProducts();
  }, []);
  return (
    <>
      {loading ? <Loader /> : ""}
      <Container className="bg-filler">
        <Row className="py-3">
          <Row className="">
            <div className="text-start">
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="backicon pointer mb-3"
                onClick={handleBack}
              />
            </div>
            <h1 className="mb-3">{reviewId ? "Edit" : "Add"} Review</h1>
            {message && <div className="alert alert-info">{message}</div>}
          </Row>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProductName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProductName">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="designation"
                    placeholder="Enter Email"
                    value={formData.designation}
                    onChange={handleInputChange}
                    isInvalid={!!errors.designation}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.designation}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formSubCategory">
                  <Form.Label>Ratings</Form.Label>
                  <Form.Select
                    name="ratings"
                    value={formData.ratings}
                    onChange={handleInputChange}
                    isInvalid={!!errors.ratings}
                  >
                    <option value="">Select a Rating</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.ratings}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formSubCategory">
                  <Form.Label>Product</Form.Label>
                  <Form.Select
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    isInvalid={!!errors.product}
                  >
                    <option value="">Select a product</option>
                    {allProducts &&
                      allProducts.map((row) => (
                        <option value={row.id}>{row.product_name}</option>
                      ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.ratings}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    isInvalid={!!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-3">
              <Button className="button" type="submit">
                {reviewId ? "Edit" : "Add"} Review
              </Button>
            </div>
          </Form>
        </Row>
      </Container>
    </>
  );
};

export default AddReview;
