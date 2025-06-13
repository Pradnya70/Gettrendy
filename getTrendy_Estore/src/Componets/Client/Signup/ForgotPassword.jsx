"use client"

import { useState } from "react"
import { Button, Container, Row, Col, Modal, Form, Alert } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Loader from "../Loader/Loader"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import Footer from "../Footer/Footer"
import "./LoginPage.css"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState({})
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [showResetForm, setShowResetForm] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [alertInfo, setAlertInfo] = useState({ show: false, variant: "", message: "" })
  const [devOtp, setDevOtp] = useState("") // For development testing

  const navigate = useNavigate()

  const handleClose = () => setShow(false)

  const showAlert = (variant, message) => {
    setAlertInfo({
      show: true,
      variant,
      message,
    })
    setTimeout(() => {
      setAlertInfo({ show: false, variant: "", message: "" })
    }, 5000)
  }

  const validateEmail = () => {
    let valid = true
    const newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) {
      newErrors.email = "Email address is required"
      valid = false
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email address"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const validateOtp = () => {
    let valid = true
    const newErrors = {}

    if (!otp) {
      newErrors.otp = "OTP is required"
      valid = false
    } else if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      newErrors.otp = "OTP must be 6 digits"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const validatePassword = () => {
    let valid = true
    const newErrors = {}

    if (!newPassword) {
      newErrors.newPassword = "New password is required"
      valid = false
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
      valid = false
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required"
      valid = false
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSendOtp = async () => {
    if (validateEmail()) {
      setLoading(true)
      try {
        const response = await axios.post("http://localhost:5000/api/auth/forgot-password", { email })
        setMessage(response.data.message)
        setShow(true)
        setIsOtpSent(true)
        showAlert("success", "OTP sent successfully to your email")

        // For development/testing - if the backend returns the OTP
        if (response.data.otp) {
          setDevOtp(response.data.otp)
          console.log("Development OTP:", response.data.otp)
        }
      } catch (error) {
        const errorMsg = error?.response?.data?.message || "Something went wrong"
        setMessage(errorMsg)
        setShow(true)
        showAlert("danger", errorMsg)
        console.error("Error sending OTP:", error.response?.data || error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleVerifyOtp = async () => {
    if (validateOtp()) {
      setLoading(true)
      try {
        const response = await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp })
        setMessage(response.data.message)
        setShow(true)
        setResetToken(response.data.resetToken)
        setShowResetForm(true)
        showAlert("success", "OTP verified successfully")
      } catch (error) {
        const errorMsg = error?.response?.data?.message || "Invalid OTP"
        setMessage(errorMsg)
        setShow(true)
        showAlert("danger", errorMsg)
        console.error("Error verifying OTP:", error.response?.data || error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleResetPassword = async () => {
    if (validatePassword()) {
      setLoading(true)
      try {
        const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
          resetToken,
          newPassword,
        })
        setMessage(response.data.message)
        setShow(true)
        showAlert("success", "Password reset successful! Redirecting to login...")

        // Redirect to login after successful password reset
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } catch (error) {
        const errorMsg = error?.response?.data?.message || "Password reset failed"
        setMessage(errorMsg)
        setShow(true)
        showAlert("danger", errorMsg)
        console.error("Error resetting password:", error.response?.data || error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const resendOtp = async () => {
    if (validateEmail()) {
      setLoading(true)
      try {
        const response = await axios.post("http://localhost:5000/api/auth/forgot-password", { email })
        setMessage("OTP resent successfully")
        setShow(true)
        showAlert("success", "OTP resent to your email")

        // For development/testing - if the backend returns the OTP
        if (response.data.otp) {
          setDevOtp(response.data.otp)
          console.log("Development OTP:", response.data.otp)
        }
      } catch (error) {
        const errorMsg = error?.response?.data?.message || "Failed to resend OTP"
        setMessage(errorMsg)
        setShow(true)
        showAlert("danger", errorMsg)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      {loading && <Loader />}
      <Container fluid className="d-flex align-items-center justify-content-center login-container">
        <Container fluid>
          <Row className="vh-100">
            <Col
              className="d-flex flex-column align-items-center justify-content-center login-image-col"
              style={{ backgroundColor: "#FFFFFF", position: "relative" }}
            >
              <div className="login-form-container">
                <h1 className="mb-3 text-center loginheding">
                  {showResetForm ? "Reset Password" : isOtpSent ? "Verify OTP" : "Forgot Password"}
                </h1>
                <p className="text-center">
                  {showResetForm
                    ? "Enter your new password"
                    : isOtpSent
                      ? "Enter the OTP sent to your email"
                      : "Enter your email to receive a password reset OTP"}
                </p>

                {alertInfo.show && (
                  <Alert
                    variant={alertInfo.variant}
                    onClose={() => setAlertInfo({ ...alertInfo, show: false })}
                    dismissible
                  >
                    {alertInfo.message}
                  </Alert>
                )}

                {/* Development mode OTP display */}
                {devOtp && (
                  <Alert variant="info" className="mb-3">
                    <strong>Development Mode:</strong> Use this OTP for testing: <code>{devOtp}</code>
                  </Alert>
                )}

                {!isOtpSent && (
                  <Form>
                    <div className="buttomsapcec">
                      <label htmlFor="email" className="title-heading">
                        Email Address
                      </label>
                      <div className="input-group">
                        <input
                          type="email"
                          id="email"
                          placeholder="Enter your Email Address"
                          className="custom-input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                      </div>
                      {errors.email && <p className="text-danger">{errors.email}</p>}
                    </div>

                    <div className="d-flex align-items-center justify-content-center mt-4">
                      <Button className="cutomebutton" onClick={handleSendOtp}>
                        Send OTP
                      </Button>
                    </div>
                  </Form>
                )}

                {isOtpSent && !showResetForm && (
                  <Form>
                    <div className="buttomsapcec">
                      <label htmlFor="otp" className="title-heading">
                        OTP
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          id="otp"
                          placeholder="Enter 6-digit OTP"
                          className="custom-input"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                        />
                      </div>
                      {errors.otp && <p className="text-danger">{errors.otp}</p>}
                    </div>

                    <div className="d-flex align-items-center justify-content-center mt-4">
                      <Button className="cutomebutton" onClick={handleVerifyOtp}>
                        Verify OTP
                      </Button>
                    </div>

                    <div className="text-center mt-3">
                      <span
                        onClick={resendOtp}
                        style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline" }}
                      >
                        Resend OTP
                      </span>
                    </div>
                  </Form>
                )}

                {showResetForm && (
                  <Form>
                    <div className="buttomsapcec">
                      <label htmlFor="newPassword" className="title-heading">
                        New Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="newPassword"
                          placeholder="Enter new password"
                          className="custom-input"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <FontAwesomeIcon
                          icon={showPassword ? faEye : faEyeSlash}
                          className="input-icon"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                      {errors.newPassword && <p className="text-danger">{errors.newPassword}</p>}
                    </div>

                    <div className="buttomsapcec">
                      <label htmlFor="confirmPassword" className="title-heading">
                        Confirm Password
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          placeholder="Confirm new password"
                          className="custom-input"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <FontAwesomeIcon
                          icon={showConfirmPassword ? faEye : faEyeSlash}
                          className="input-icon"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                      {errors.confirmPassword && <p className="text-danger">{errors.confirmPassword}</p>}
                    </div>

                    <div className="d-flex align-items-center justify-content-center mt-4">
                      <Button className="cutomebutton" onClick={handleResetPassword}>
                        Reset Password
                      </Button>
                    </div>
                  </Form>
                )}

                <div className="d-flex justify-content-center align-items-center mt-3">
                  <p onClick={() => navigate("/login")} style={{ cursor: "pointer", color: "#007bff" }}>
                    Back to Login
                  </p>
                </div>
              </div>

              {/* Login Image */}
              <div className="login-img">
                <img src="/Images/Login_img.png" alt="Login" />
              </div>
            </Col>
          </Row>
        </Container>
      </Container>

      {/* Modal for messages */}
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
  )
}

export default ForgotPassword
