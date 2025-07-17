import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { BASEURL } from "../../Client/Comman/CommanConstans";
import { useAuth } from "../../AuthContext/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../Client/Loader/Loader";

const EditUser = () => {
  const { userToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    mobile_number: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [originalData, setOriginalData] = useState({
    username: "",
    email: "",
    mobile_number: "",
    pincode: "",
  });
  const [user, setALLUsers] = useState([]);
  const [loading, setLoading] = useState(false);
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
    if (!formData.username)
      errors.username = "User name is required";
    
    if (!formData.email) errors.email = "Email is required";
    if (!formData.mobile_number) errors.mobile_number = "Mobile Number is required";
    if (!formData.pincode) errors.pincode = "Pin Code is required";
    setErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setMessage("Please fill out all fields");
      return;
    }
    if (userId) {
      const formDataToSend = new FormData();
      if (originalData.username !== formData.username) {
        formDataToSend.append("User Name", formData.username);
      }
      if (originalData.email !== formData.email) {
        formDataToSend.append("Email", formData.email);
      }
      if (originalData.mobile_number !== formData.mobile_number) {
        formDataToSend.append("Mobile Number", formData.mobile_number);
      }
      if (originalData.pincode !== formData.pincode) {
        formDataToSend.append("Pin Code", formData.pincode);
      }

      try {
        const response = await axios.put(
          `${BASEURL}/accounts/user/${userId}`,
          formDataToSend,
          {
            headers: {
              "x-access-token": userToken,
            },
          }
        );
        if (response.data) {
          navigate("/admin-users");
        }
        setMessage("User Edited successfully");
      } catch (error) {
        setMessage("Failed to Edit User");
        console.error(error);
      }
    } else {
      const formDataToSend = new FormData();
      formDataToSend.append("User Name", formData.user_name);
      formDataToSend.append("Email", formData.email);
      formDataToSend.append("Mobile Number", formData.mobile_number);
      formDataToSend.append("Pin Code", formData.pincode);

      try {
        const response = await axios.post(
          `${BASEURL}/accounts/user`,
          formDataToSend,
          {
            headers: {
              "x-access-token": userToken,
            },
          }
        );
        if (response.data) {
          navigate("/admin-users");
        }
        setMessage("User added successfully");
      } catch (error) {
        setMessage("Failed to add User");
        console.error(error);
      }
    }
  };

  

  const getUserById = async (id) => {
    try {
      const headers = {
        "x-access-token": userToken,
      };
      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/accounts/user/${id}`,
        {
          headers,
        }
      );
      if (response) {
        setLoading(false);
        const data = response.data.data;
        setFormData({
          username: data.username,
          email: data.email,
          mobile_number: data.mobile_number,
          pincode: data.pincode,
        });
        // setSelectedImage(BASEURL + data.category_image);
        setOriginalData({
          username: data.username,
          email: data.email,
          mobile_number: data.mobile_number,
          pincode: data.pincode,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const userId = location?.state?.userID;
    if (userId) {
      getUserById(userId);
      setUserId(userId);
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
            <h1 className="mb-3">Edit User</h1>
            {message && <div className="alert alert-info">{message}</div>}
          </Row>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProductName">
                  <Form.Label>User Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Enter User name"
                    value={formData.username}
                    onChange={handleInputChange}
                    isInvalid={!!errors.username}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProductName">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProductName">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="mobile_number"
                    placeholder="Enter Mobile Number"
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                    isInvalid={!!errors.mobile_number}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.mobile_number}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formProductName">
                  <Form.Label>Pin Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="pincode"
                    placeholder="Enter Pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    isInvalid={!!errors.pincode}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.pincode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-3">
              <Button className="button" type="submit">
                Edit User
              </Button>
            </div>
          </Form>
        </Row>
      </Container>
    </>
  );
};

export default EditUser;
