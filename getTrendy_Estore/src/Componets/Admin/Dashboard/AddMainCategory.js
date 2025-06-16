"use client";

import { useState, useEffect } from "react";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Col,
  Container,
  Form,
  Row,
  Card,
  Modal,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../Client/Loader/Loader";
import ApiService from "../../api/services/api-service";
import { BASEURL } from "../../Client/Comman/CommanConstans";

const AddMainCategory = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    category_name: "",
    category_description: "",
    category_image: null,
  });

  // Handle back button
  const handleBack = () => {
    window.history.back();
  };

  // Close message modal
  const handleCloseMessage = () => setShowMessage(false);

  // Show message
  const showMessageAlert = (msg) => {
    setMessage(msg);
    setShowMessage(true);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setPreviewImage(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.category_name)
      newErrors.category_name = "Category name is required";
    if (!formData.category_description)
      newErrors.category_description = "Description is required";

    // Only require image for new categories
    if (!categoryId && !formData.category_image) {
      newErrors.category_image = "Category image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showMessageAlert("Please correct the errors before submitting");
      return;
    }

    try {
      setLoading(true);

      // Create FormData object for the API request
      const formDataToSend = new FormData();
      formDataToSend.append("category_name", formData.category_name);
      formDataToSend.append(
        "category_description",
        formData.category_description
      );

      if (formData.category_image) {
        formDataToSend.append("category_image", formData.category_image);
      }

      let response;

      if (categoryId) {
        // Update existing category
        response = await ApiService.updateCategory(categoryId, formDataToSend);
        showMessageAlert("Category updated successfully");
      } else {
        // Create new category
        response = await ApiService.createCategory(formDataToSend);
        showMessageAlert("Category added successfully");
      }

      setLoading(false);

      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 2000);
    } catch (error) {
      setLoading(false);
      console.error("Error saving category:", error);
      showMessageAlert(
        `Error: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Fetch category by ID
  const fetchCategoryById = async (id) => {
    try {
      setLoading(true);
      const response = await ApiService.getCategoryById(id);

      if (response && response.data && response.data.data) {
        const category = response.data.data;

        // Set form data from category
        setFormData({
          category_name: category.category_name || "",
          category_description: category.category_description || "",
          category_image: null, // We don't load the actual file object, just the URL
        });

        // Set preview image if available
        if (category.category_image) {
          setPreviewImage(`${BASEURL}${category.category_image}`);
        }
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching category:", error);
      showMessageAlert(
        `Error: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Initialize component
  useEffect(() => {
    // Check if we're editing an existing category
    const categoryIdFromState = location?.state?.mainCategoryId;
    if (categoryIdFromState) {
      setCategoryId(categoryIdFromState);
      fetchCategoryById(categoryIdFromState);
    }
  }, [location]);

  return (
    <>
      {loading && <Loader />}

      <Container className="py-4">
        <div className="d-flex align-items-center mb-4">
          <Button
            variant="outline-secondary"
            onClick={handleBack}
            className="me-3"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>
          <h2 className="mb-0">
            {categoryId ? "Edit Category" : "Add New Category"}
          </h2>
        </div>

        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit} noValidate>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category Name*</Form.Label>
                    <Form.Control
                      type="text"
                      name="category_name"
                      value={formData.category_name}
                      onChange={handleInputChange}
                      isInvalid={!!errors.category_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.category_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category Image{!categoryId && "*"}</Form.Label>
                    <Form.Control
                      type="file"
                      name="category_image"
                      onChange={handleInputChange}
                      accept="image/*"
                      isInvalid={!!errors.category_image}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.category_image}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {previewImage && (
                    <div className="mt-2">
                      <img
                        src={previewImage || "/placeholder.svg"}
                        alt="Category Preview"
                        className="img-thumbnail"
                        style={{ maxHeight: "150px" }}
                      />
                    </div>
                  )}
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description*</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="category_description"
                      value={formData.category_description}
                      onChange={handleInputChange}
                      isInvalid={!!errors.category_description}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.category_description}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {categoryId ? "Update Category" : "Add Category"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      {/* Message Modal */}
      <Modal show={showMessage} onHide={handleCloseMessage}>
        <Modal.Header closeButton>
          <Modal.Title>
            {message.includes("Error") ? "Error" : "Success"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMessage}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddMainCategory;
