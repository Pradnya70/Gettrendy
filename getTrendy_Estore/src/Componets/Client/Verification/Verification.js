// src/Components/Verification.js

import React, { useEffect, useState } from "react";
import "./Verification.css"; // Import the CSS for styling
import Footer from "../Footer/Footer";
import axios from "axios";
import { BASEURL } from "../Comman/CommanConstans";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext/AuthContext";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import OtpInput from "react-otp-input";

const Verification = () => {
  const navigate = useNavigate();

  const { login } = useAuth();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [number, setNumber] = useState(0);
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = async (e) => {
    try {
      const payload = {
        mobile_number: number,
        sms_otp: otp,
      };

      const response = await axios.post(
        `${BASEURL}/accounts/verify-otp/nt/`,
        payload
      );

      if (response.data) {
        const userRole = response.data.user_role;
        const token = response.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("role", userRole);

        if (token && userRole) {
          login(token, userRole);

          if (userRole === "Store_admin") {
            navigate("/admin-allcategory");
          } else {
            navigate("/");
          }
        } else {
          console.error("Token or user role is missing in response");
        }
      }
    } catch (error) {
      console.log(error);
      const message = error?.response?.data?.message;
      setMessage(message);
      handleShow();
    }
  };

  useEffect(() => {
    const mobile_number = location?.state?.userphone;
    if (mobile_number) {
      setNumber(mobile_number);
    }
  }, []);
  return (
    <>
      <div className="verification-container">
        <div className="opt-form">
          <h1>Verify Your Account</h1>
          <div className="otp-container mt-3">
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              renderSeparator={<span className="otp-separator">-</span>} // Separator
              renderInput={(props) => (
                <input {...props} className="otp-input" />
              )}
            />
          </div>

          <Button className="button mt-5" onClick={() => handleSubmit()}>
            Verify OTP
          </Button>
        </div>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Footer />
    </>
  );
};

export default Verification;
