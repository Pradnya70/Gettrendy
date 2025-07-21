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
import axios from "axios";
import { BASEURL, getImageUrl } from "../../Client/Comman/CommanConstans";
import { useAuth } from "../../AuthContext/AuthContext";

const AddCategory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [mainCategories, setMainCategories] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    subcategory_name: "",
    subcategory_description: "",
    parent_category: "",
    subcategory_image: null,
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

  // Fetch all main categories
  const fetchMainCategories = async () => {
    try {
      setLoading(true);
      const headers = {
        "x-access-token": userToken,
      };
      const response = await axios.get(`${BASEURL}/api/category?limit=100`, {
        headers,
      });
      if (response && response.data && response.data.rows) {
        setMainCategories(response.data.rows);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching main categories:", error);
      showMessageAlert(
        `Error: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.subcategory_name)
      newErrors.subcategory_name = "Subcategory name is required";
    if (!formData.subcategory_description)
      newErrors.subcategory_description = "Description is required";
    if (!formData.parent_category)
      newErrors.parent_category = "Parent category is required";

    // Only require image for new subcategories
    if (!categoryId && !formData.subcategory_image) {
      newErrors.subcategory_image = "Subcategory image is required";
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
      formDataToSend.append("subcategory_name", formData.subcategory_name);
      formDataToSend.append(
        "subcategory_description",
        formData.subcategory_description
      );
      formDataToSend.append("parent_category", formData.parent_category);

      if (formData.subcategory_image) {
        formDataToSend.append("subcategory_image", formData.subcategory_image);
      }

      const headers = {
        "x-access-token": userToken,
        "Content-Type": "multipart/form-data",
      };

      let response;

      if (categoryId) {
        // Update existing subcategory
        response = await axios.put(
          `${BASEURL}/api/subcategory/${categoryId}`,
          formDataToSend,
          { headers }
        );
        showMessageAlert("Subcategory updated successfully");
      } else {
        // Create new subcategory
        response = await axios.post(
          `${BASEURL}/api/subcategory`,
          formDataToSend,
          { headers }
        );
        showMessageAlert("Subcategory added successfully");
      }

      setLoading(false);

      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 2000);
    } catch (error) {
      setLoading(false);
      console.error("Error saving subcategory:", error);
      showMessageAlert(
        `Error: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Fetch subcategory by ID
  const fetchSubcategoryById = async (id) => {
    try {
      setLoading(true);
      const headers = {
        "x-access-token": userToken,
      };
      const response = await axios.get(`${BASEURL}/api/subcategory/${id}`, {
        headers,
      });

      if (response && response.data && response.data.data) {
        const subcategory = response.data.data;

        // Set form data from subcategory
        setFormData({
          subcategory_name: subcategory.subcategory_name || "",
          subcategory_description: subcategory.subcategory_description || "",
          parent_category: subcategory.parent_category?._id || "",
          subcategory_image: null, // We don't load the actual file object, just the URL
        });

        // Set preview image if available
        if (subcategory.subcategory_image) {
          setPreviewImage(subcategory.subcategory_image);
        }
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching subcategory:", error);
      showMessageAlert(
        `Error: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Initialize component
  useEffect(() => {
    fetchMainCategories();

    // Check if we're editing an existing subcategory
    const categoryIdFromState = location?.state?.categoryID;
    if (categoryIdFromState) {
      setCategoryId(categoryIdFromState);
      fetchSubcategoryById(categoryIdFromState);
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
            {categoryId ? "Edit Subcategory" : "Add New Subcategory"}
          </h2>
        </div>

        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit} noValidate>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Subcategory Name*</Form.Label>
                    <Form.Control
                      type="text"
                      name="subcategory_name"
                      value={formData.subcategory_name}
                      onChange={handleInputChange}
                      isInvalid={!!errors.subcategory_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.subcategory_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Parent Category*</Form.Label>
                    <Form.Select
                      name="parent_category"
                      value={formData.parent_category}
                      onChange={handleInputChange}
                      isInvalid={!!errors.parent_category}
                    >
                      <option value="">Select Parent Category</option>
                      {mainCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.category_name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.parent_category}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Subcategory Image{!categoryId && "*"}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="subcategory_image"
                      onChange={handleInputChange}
                      accept="image/*"
                      isInvalid={!!errors.subcategory_image}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.subcategory_image}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {previewImage && (
                    <div className="mt-2">
                      <img
                        src={getImageUrl(previewImage)}
                        alt="Subcategory Preview"
                        className="img-thumbnail"
                        style={{ maxHeight: "150px" }}
                      />
                    </div>
                  )}
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description*</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="subcategory_description"
                      value={formData.subcategory_description}
                      onChange={handleInputChange}
                      isInvalid={!!errors.subcategory_description}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.subcategory_description}
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
                  {categoryId ? "Update Subcategory" : "Add Subcategory"}
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

export default AddCategory;
