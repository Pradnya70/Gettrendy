import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { BASEURL } from "../../Client/Comman/CommanConstans";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../AuthContext/AuthContext";

const InventoryCrud = () => {
  const { userToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState([]);
  const [store, setAllStore] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [productId, setProductId] = useState(null);

  const [formData, setFormData] = useState({
    product: "",
    store: "",
    stock: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [originalData, setOriginalData] = useState({
    product: "",
    store: "",
    stock: "",
  });

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
    if (!formData.product) errors.product = "product is required";
    if (!formData.store) errors.store = "store is required";
    if (!formData.stock) errors.stock = "stock is required";
    setErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setMessage("Please fill out all fields");
      return;
    }
    if (productId) {
      const payload = {
        product: formData.product,
        store: formData.store,
        stock: formData.stock,
      };

      try {
        const response = await axios.put(
          `${BASEURL}/store-admin/inventory/${productId}`,
          payload,
          {
            headers: {
              "x-access-token": userToken,
            },
          }
        );
        if (response.data) {
          navigate("/admin-AllInventory");
        }
        setMessage("Product added successfully");
      } catch (error) {
        setMessage("Failed to add product");
        console.error(error);
      }
    } else {
      const payload = {
        product: formData.product,
        store: formData.store,
        stock: formData.stock,
      };

      try {
        const response = await axios.post(
          `${BASEURL}/store-admin/inventory`,
          payload,
          {
            headers: {
              "x-access-token": userToken,
            },
          }
        );
        if (response.data) {
          navigate("/admin-AllInventory");
        }
        setMessage("Product added successfully");
      } catch (error) {
        setMessage("Failed to add product");
        console.error(error);
      }
    }
  };
  const getAllProducts = async () => {
    try {
      const response = await axios.get(
        `${BASEURL}/store-admin/products?page=1&limit=100`,
        {
          headers: {
            "x-access-token": userToken,
          },
        }
      );
      if (response) {
        setProduct(response.data.rows);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getAllStore = async () => {
    try {
      const response = await axios.get(
        `${BASEURL}/store-admin/store?page=1&limit=100`,
        {
          headers: {
            "x-access-token": userToken,
          },
        }
      );
      if (response) {
        setAllStore(response.data.rows);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleBack = () => {
    window.history.back();
  };

  const getProductById = async (id) => {
    try {
      const headers = {
        "x-access-token": userToken,
      };
      const response = await axios.get(
        `${BASEURL}/store-admin/inventory/${id}`,
        {
          headers,
        }
      );
      if (response) {
        const data = response.data.data;
        setFormData({
          product: data.product,
          store: data.store,
          stock: data.stock,
        });
        setOriginalData({
          product: data.product,
          store: data.store,
          stock: data.stock,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const inventoryID = location?.state?.inventoryId;
    setProductId(inventoryID);

    if (inventoryID) {
      getProductById(inventoryID);
    }
    getAllProducts();
    getAllStore();
  }, [productId]);

  return (
    <>
      <Container className="py-5">
        <Row>
          <div className="text-start">
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="backicon pointer mb-3"
              onClick={handleBack}
            />
          </div>
          <h1 className="mb-3">{productId ? "Edit" : "Add"} Inventory</h1>
          {message && <div className="alert alert-info">{message}</div>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProduct">
                  <Form.Label>Product</Form.Label>
                  <Form.Select
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    isInvalid={!!errors.product}
                  >
                    <option value="">Select a Product</option>
                    {product &&
                      product.map((row) => (
                        <option value={row.id} key={row.id}>
                          {row.product_name}
                        </option>
                      ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.product}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="formSubCategory">
                  <Form.Label>Store</Form.Label>
                  <Form.Select
                    name="store"
                    value={formData.store}
                    onChange={handleInputChange}
                    isInvalid={!!errors.store}
                  >
                    <option value="">Select a Store</option>
                    {store &&
                      store.map((row) => (
                        <option value={row.id} key={row.id}>
                          {row.store_name}
                        </option>
                      ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.store}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formPrice">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    placeholder="Enter product stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    isInvalid={!!errors.stock}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.stock}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-3">
              <Button className="button" type="submit">
                {productId ? "Edit" : "Add"}
              </Button>
            </div>
          </Form>
        </Row>
      </Container>
    </>
  );
};

export default InventoryCrud;
