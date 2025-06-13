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
import API_CONFIG from "../../api/services/api-config";

const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const BASEURL = API_CONFIG.baseURL;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [productId, setProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    price: "",
    discount_price: "",
    category: "",
    subcategory: "",
    stock: "0",
    featured: false,
    sizes: [],
    colors: [],
    images: [],
  });

  // Available sizes and colors
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const availableColors = [
    "Red",
    "Blue",
    "Green",
    "Black",
    "White",
    "Yellow",
    "Purple",
    "Orange",
    "Pink",
  ];

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
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      // Handle multiple file uploads
      const fileArray = Array.from(files);
      setFormData({ ...formData, [name]: [...formData.images, ...fileArray] });

      // Create preview URLs for the images
      const newPreviewImages = [...previewImages];
      fileArray.forEach((file) => {
        newPreviewImages.push(URL.createObjectURL(file));
      });
      setPreviewImages(newPreviewImages);
    } else if (name === "category") {
      // When category changes, filter subcategories and update form
      setFormData({ ...formData, [name]: value, subcategory: "" });

      // Filter subcategories based on selected category
      const filtered = subcategories.filter(
        (subcategory) => subcategory.parent_category === value
      );
      setFilteredSubcategories(filtered);
    } else if (name === "sizes" || name === "colors") {
      // Handle multi-select for sizes and colors
      const selectedValues = Array.from(
        e.target.selectedOptions,
        (option) => option.value
      );
      setFormData({ ...formData, [name]: selectedValues });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Remove preview image
  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);

    const newPreviews = [...previewImages];
    URL.revokeObjectURL(newPreviews[index]); // Clean up the URL
    newPreviews.splice(index, 1);

    setFormData({ ...formData, images: newImages });
    setPreviewImages(newPreviews);
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.product_name)
      newErrors.product_name = "Product name is required";
    if (!formData.product_description)
      newErrors.product_description = "Description is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (formData.price && isNaN(formData.price))
      newErrors.price = "Price must be a number";
    if (formData.discount_price && isNaN(formData.discount_price))
      newErrors.discount_price = "Discount price must be a number";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.stock && isNaN(formData.stock))
      newErrors.stock = "Stock must be a number";

    // Only require images for new products
    if (!productId && (!formData.images || formData.images.length === 0)) {
      newErrors.images = "At least one image is required";
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
      formDataToSend.append("product_name", formData.product_name);
      formDataToSend.append(
        "product_description",
        formData.product_description
      );
      formDataToSend.append("price", formData.price);

      if (formData.discount_price) {
        formDataToSend.append("discount_price", formData.discount_price);
      }

      formDataToSend.append("category", formData.category);

      if (formData.subcategory) {
        formDataToSend.append("subcategory", formData.subcategory);
      }

      formDataToSend.append("stock", formData.stock || 0);
      formDataToSend.append("featured", formData.featured);

      // Add sizes and colors
      formData.sizes.forEach((size) => {
        formDataToSend.append("sizes", size);
      });

      formData.colors.forEach((color) => {
        formDataToSend.append("colors", color);
      });

      // Add images
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image) => {
          if (image instanceof File) {
            formDataToSend.append("images", image);
          }
        });
      }

      let response;

      if (productId) {
        // Update existing product
        response = await ApiService.updateProduct(productId, formDataToSend);
        showMessageAlert("Product updated successfully");
      } else {
        // Create new product
        response = await ApiService.createProduct(formDataToSend);
        showMessageAlert("Product added successfully");
      }

      setLoading(false);

      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate("/admin-dashboard");
      }, 2000);
    } catch (error) {
      setLoading(false);
      console.error("Error saving product:", error);
      showMessageAlert(
        `Error: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await ApiService.getCategories(1, 100);

      if (response && response.data) {
        setCategories(response.data.rows || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch subcategories
  const fetchSubcategories = async () => {
    try {
      const response = await ApiService.getSubcategories(1, 100);

      if (response && response.data) {
        setSubcategories(response.data.rows || []);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  // Fetch product by ID
  const fetchProductById = async (id) => {
    try {
      setLoading(true);

      const response = await ApiService.getProductById(id);

      if (response && response.data && response.data.data) {
        const product = response.data.data;

        // Set form data from product
        setFormData({
          product_name: product.product_name || "",
          product_description: product.product_description || "",
          price: product.price || "",
          discount_price: product.discount_price || "",
          category: product.category?._id || "",
          subcategory: product.subcategory?._id || "",
          stock: product.stock?.toString() || "0",
          featured: product.featured || false,
          sizes: product.sizes || [],
          colors: product.colors || [],
          images: [], // We don't load the actual file objects, just the URLs
        });

        // Filter subcategories based on selected category
        if (product.category?._id) {
          const filtered = subcategories.filter(
            (subcategory) =>
              subcategory.parent_category === product.category._id
          );
          setFilteredSubcategories(filtered);
        }

        // Set preview images from existing product images
        if (product.images && product.images.length > 0) {
          const imagePreviews = product.images.map((img) => BASEURL + img);
          setPreviewImages(imagePreviews);
        }
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching product:", error);
      showMessageAlert(
        `Error: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Initialize component
  useEffect(() => {
    fetchCategories();
    fetchSubcategories();

    // Check if we're editing an existing product
    const productIdFromState = location?.state?.productId;
    if (productIdFromState) {
      setProductId(productIdFromState);
      fetchProductById(productIdFromState);
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
            {productId ? "Edit Product" : "Add New Product"}
          </h2>
        </div>

        <Form onSubmit={handleSubmit}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Basic Information</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Name*</Form.Label>
                    <Form.Control
                      type="text"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleInputChange}
                      isInvalid={!!errors.product_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.product_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price*</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          isInvalid={!!errors.price}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.price}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Discount Price</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="discount_price"
                          value={formData.discount_price}
                          onChange={handleInputChange}
                          isInvalid={!!errors.discount_price}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.discount_price}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description*</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="product_description"
                      value={formData.product_description}
                      onChange={handleInputChange}
                      isInvalid={!!errors.product_description}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.product_description}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h4>Categories</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category*</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      isInvalid={!!errors.category}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.category_name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.category}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Subcategory</Form.Label>
                    <Form.Select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      disabled={!formData.category}
                    >
                      <option value="">Select Subcategory</option>
                      {filteredSubcategories.map((subcategory) => (
                        <option key={subcategory._id} value={subcategory._id}>
                          {subcategory.subcategory_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h4>Inventory</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Stock</Form.Label>
                    <Form.Control
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      isInvalid={!!errors.stock}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.stock}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Featured Product"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    <Form.Check
                      type="checkbox"
                      label="Bestseller Product"
                      name="featured"
                      checked={formData.bestseller}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h4>Variants</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sizes</Form.Label>
                    <Form.Select
                      multiple
                      name="sizes"
                      value={formData.sizes}
                      onChange={handleInputChange}
                      style={{ height: "150px" }}
                    >
                      {availableSizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Hold Ctrl (or Cmd on Mac) to select multiple sizes
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Colors</Form.Label>
                    <Form.Select
                      multiple
                      name="colors"
                      value={formData.colors}
                      onChange={handleInputChange}
                      style={{ height: "150px" }}
                    >
                      {availableColors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Hold Ctrl (or Cmd on Mac) to select multiple colors
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h4>Images</h4>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Product Images{!productId && "*"}</Form.Label>
                <Form.Control
                  type="file"
                  name="images"
                  onChange={handleInputChange}
                  multiple
                  accept="image/*"
                  isInvalid={!!errors.images}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.images}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  You can select multiple images at once
                </Form.Text>
              </Form.Group>

              {previewImages.length > 0 && (
                <div className="mt-3">
                  <h5>Image Previews:</h5>
                  <div className="d-flex flex-wrap gap-3 mt-2">
                    {previewImages.map((preview, index) => (
                      <div
                        key={index}
                        className="position-relative"
                        style={{ width: "150px" }}
                      >
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="img-thumbnail"
                          style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                          }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0"
                          onClick={() => removeImage(index)}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end mb-5">
            <Button variant="secondary" onClick={handleBack} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {productId ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </Form>
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

export default AddProduct;
