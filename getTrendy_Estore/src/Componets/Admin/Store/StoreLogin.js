import {
  faEnvelope,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Button, Col, Container, Modal, Row } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import Footer from "../../Client/Footer/Footer";
import axios from "axios";
import { BASEURL } from "../../Client/Comman/CommanConstans";
import Loader from "../../Client/Loader/Loader";
import { useAuth } from "../../AuthContext/AuthContext";

const StoreLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  let [type, setType] = useState("password");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  const togglePasswordVisibility = () => {
    setType(type === "password" ? "text" : "password");
  };

  const navigateToRegister = () => {
    navigate("/storeRegister");
    window.scroll(0, 0);
  };

  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    if (validateForm()) {
      setLoading(true);

      try {
        const payload = {
          email: email,
          password: password,
        };
        const response = await axios.post(
          BASEURL + "/accounts/user-login/nt/",
          payload
        );
        if (response.data.data) {
          setLoading(false);
          const token = response?.data?.token;
          const userRole = response?.data?.data?.user_role;
          login(token, userRole);
          if (response?.data?.data?.user_role === "Store_admin")
            navigate("/admin-store");
        }
      } catch (error) {
        setLoading(false);
        const errorMessage = error?.response?.data?.message;
        setMessage(errorMessage);
        handleShow();
        console.log(error);
      }
    }
  };
  return (
    <>
      {loading ? <Loader /> : ""}
      <Container
        fluid
        className="d-flex align-items-center justify-content-center login-container"
      >
        <Container fluid>
          <Row className="vh-100">
            <Col
              className="d-flex flex-column align-items-center justify-content-center login-image-col"
              style={{
                backgroundColor: "#FFFFFF",
                position: "relative",
              }}
            >
              <div className="login-form-container">
                <h1 className="mb-5 text-center loginheding">Welcome back!</h1>
                <p className="text-center">
                  Log in to manage your business, connect with customers, and
                  grow with our powerful tools.
                </p>

                <form>
                  <div className="buttomsapcec">
                    <label htmlFor="email" className="title-heading">
                      User Name
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        id="email"
                        placeholder="Enter your User Name"
                        className="custom-input"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="input-icon"
                      />
                    </div>
                    {errors && <p className="text-danger">{errors.email}</p>}
                  </div>
                  <div className="buttomsapcec">
                    <label htmlFor="Password" className="title-heading">
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        type={type}
                        id="Password"
                        placeholder="Enter your Password"
                        className="custom-input"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <FontAwesomeIcon
                        icon={type === "password" ? faEyeSlash : faEye}
                        className="input-icon pointer"
                        onClick={() => togglePasswordVisibility()}
                      />
                    </div>
                    {errors && <p className="text-danger">{errors.password}</p>}
                  </div>
                </form>
                <div className="d-flex align-items-center justify-content-center">
                  <Button
                    className="cutomebutton"
                    onClick={() => handleSubmit()}
                  >
                    Sign In
                  </Button>
                </div>
                <div className="d-flex justify-content-center align-items-center mt-3">
                  <NavLink
                    to="/storeRegister"
                    onClick={() => navigateToRegister()}
                  >
                    <p>
                      Not a member?{" "}
                      <span className="create-account pointer">
                        Create an account.
                      </span>
                    </p>
                  </NavLink>
                </div>
              </div>

              {/* Image container */}
              <div className="login-img">
                <img src="/Images/Login_img.png" alt="Login" />
              </div>
            </Col>
          </Row>
        </Container>
      </Container>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button style={{ background: "#E9272D" }} onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Footer />
    </>
  );
};

export default StoreLogin;
