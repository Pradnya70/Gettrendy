import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { BASEURL } from "../../Client/Comman/CommanConstans";
import { useAuth } from "../../AuthContext/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../Client/Loader/Loader";

const AddEditStore = () => {
  const { userToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    pincode_list: [],
    store_image: null,
    store_name: "",
    store_address: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [originalData, setOriginalData] = useState({
    pincode_list: [],
    store_image: null,
    store_name: "",
    store_address: "",
  });
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    // Handle the case where pincodes are input
    if (name === "pincode_list") {
      const pincodesArray = value.split(",").map((pincode) => pincode.trim());
      setFormData((prevState) => ({
        ...prevState,
        [name]: pincodesArray, // Store as an array
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: files ? files[0] : value, // Handle file input
      }));

      // Check if there's a file and if it's a valid file before creating the URL
      if (files && files[0]) {
        const file = files[0];

        // Optional: Add further checks like file type validation (e.g., image types)
        if (file instanceof File) {
          setSelectedImage(URL.createObjectURL(file));
        }
      }
    }
  };

  const validate = () => {
    let errors = {};

    if (!formData.store_name) errors.store_name = "Store name is required";
    if (!storeId) {
      if (!formData.store_image) errors.store_image = "Store image is required";
    }
    if (!formData.store_address)
      errors.store_address = "Store address is required";
    if (formData.pincode_list.length <= 0)
      errors.pincode_list = "Pincode is required";
    setErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before proceeding
    if (!validate()) {
      setMessage("Please fill out all fields");
      return;
    }

    // Prepare FormData for sending
    const formDataToSend = new FormData();

    // If editing an existing store (storeId is available)
    if (storeId) {
      // Only append fields that are changed
      if (originalData.categoryname !== formData.categoryname) {
        formDataToSend.append("store_name", formData.categoryname);
      }
      if (originalData.categoryimage !== formData.categoryimage) {
        formDataToSend.append("store_image", formData.categoryimage);
      }
      if (
        JSON.stringify(originalData.pincode_list) !==
        JSON.stringify(formData.pincode_list)
      ) {
        formDataToSend.append(
          "pincode_list",
          JSON.stringify(formData.pincode_list)
        );
      }
      if (originalData.store_address !== formData.store_address) {
        formDataToSend.append("store_address", formData.store_address);
      }

      // Try updating the store data
      try {
        const response = await axios.put(
          `${BASEURL}/store-admin/store/${storeId}`,
          formDataToSend,
          {
            headers: {
              "x-access-token": userToken,
            },
          }
        );
        if (response.data) {
          navigate("/admin-store");
        }
        setMessage("Store updated successfully");
      } catch (error) {
        setMessage("Failed to update store");
        console.error(error);
      }
    }
    // If adding a new store (no storeId)
    else {
      formDataToSend.append("store_name", formData.store_name);
      formDataToSend.append("store_image", formData.store_image);
      formDataToSend.append("store_address", formData.store_address);
      formDataToSend.append(
        "pincode_list",
        JSON.stringify(formData.pincode_list)
      ); // Send as a JSON string

      // Try adding the new store data
      try {
        const response = await axios.post(
          `${BASEURL}/store-admin/store`,
          formDataToSend,
          {
            headers: {
              "x-access-token": userToken,
            },
          }
        );
        if (response.data) {
          navigate("/admin-store");
        }
        setMessage("Store added successfully");
      } catch (error) {
        setMessage("Failed to add store");
        console.error(error);
      }
    }
  };

  const getStoreById = async (id) => {
    try {
      const headers = {
        "x-access-token": userToken,
      };
      setLoading(true);
      const response = await axios.get(`${BASEURL}/store-admin/store/${id}`, {
        headers,
      });
      if (response) {
        setLoading(false);
        const data = response.data.data;
        setFormData({
          pincode_list: data.pincodes.map((p) => p.pincode),
          store_name: data.store_name,
          store_address: data.store_address,
        });
        setSelectedImage(BASEURL + data.store_image);
        setOriginalData({
          pincode_list: data.pincodes.map((p) => p.pincode),
          store_name: data.store_name,
          store_address: data.store_address,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const storeID = location?.state?.storeId;
    if (storeID) {
      getStoreById(storeID);
      setStoreId(storeID);
    }
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
            <h1 className="mb-3">{storeId ? "Edit" : "Add"} Store</h1>
            {message && <div className="alert alert-info">{message}</div>}
          </Row>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProductName">
                  <Form.Label>Store name</Form.Label>
                  <Form.Control
                    type="text"
                    name="store_name"
                    placeholder="Enter store name"
                    value={formData.store_name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.store_name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.store_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Row>
                  <Col lg={8}>
                    <Form.Group className="mb-3" controlId="formProductImage">
                      <Form.Label>Store image</Form.Label>
                      <Form.Control
                        type="file"
                        name="store_image"
                        onChange={handleInputChange}
                        isInvalid={!!errors.store_image}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.store_image}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col lg={4}>
                    {selectedImage && (
                      <div className="mt-3">
                        <img
                          src={selectedImage}
                          alt="Selected Preview"
                          style={{
                            width: "100%",
                            maxHeight: "100px",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    )}
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formPincodeList">
                  <Form.Label>Pincode list</Form.Label>
                  <Form.Control
                    type="text"
                    name="pincode_list"
                    placeholder="Enter Pincodes (comma-separated)"
                    value={formData?.pincode_list?.join(", ")} // Display as a string
                    onChange={handleInputChange}
                    isInvalid={!!errors.pincode_list}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.pincode_list}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label>Store Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="store_address"
                    value={formData.store_address}
                    onChange={handleInputChange}
                    isInvalid={!!errors.store_address}
                    placeholder="113, street road, india, 541289"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.store_address}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-3">
              <Button className="button" type="submit">
                {storeId ? "Edit" : "Add"} Store
              </Button>
            </div>
          </Form>
        </Row>
      </Container>
    </>
  );
};

export default AddEditStore;
