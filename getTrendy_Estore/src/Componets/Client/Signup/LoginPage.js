"use client"

import { useState } from "react"
import { Button, Container, Row, Col, Modal, Alert } from "react-bootstrap"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import "./LoginPage.css"
import { faEnvelope, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from "axios"
import Loader from "../Loader/Loader"
import { useAuth } from "../../AuthContext/AuthContext"
import Footer from "../Footer/Footer"
import { BASEURL } from "../Comman/CommanConstans"
import { toast } from "react-toastify"

const Login = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    variant: "",
    message: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

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

  const validateForm = () => {
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

    if (!password) {
      newErrors.password = "Password is required"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true)
      const payload = { email, password }

      try {
        const response = await axios.post(`${BASEURL}/api/auth/login`, payload, {
          timeout: 10000, // 10 second timeout
        })

        console.log("Login response:", response.data)

        if (response && response.data) {
          if (response.data.success) {
            // Get user data from response
            const userData = response.data.data.user
            const userToken = response.data.data.token

            console.log("User data from login:", userData)

            // Update context with user information
            await login(userToken, userData.role, userData.id, userData.name)

            // Clear form fields
            setEmail("")
            setPassword("")

            // Reset error state
            setErrors({})
            setMessage("")
            setShow(false)

            // Show success message
            showAlert("success", "Login successful! Redirecting...")
            toast.success("Login successful!")

            // Redirect after a small delay to allow message to show
            setTimeout(() => {
              const from = location.state?.from?.pathname || "/"
              console.log("Redirecting user with role:", userData.role)

              if (userData.role === "admin") {
                console.log("Redirecting to admin dashboard")
                navigate("/admin-dashboard", { replace: true })
              } else {
                console.log("Redirecting to user dashboard or home")
                navigate(from, { replace: true })
              }
            }, 1000)
          } else {
            setMessage(response.data.message || "Invalid credentials")
            setShow(true)
            showAlert("danger", response.data.message || "Invalid credentials")
            toast.error(response.data.message || "Invalid credentials")
          }
        }
      } catch (error) {
        const errorMsg = error?.response?.data?.message || "Something went wrong."
        setMessage(errorMsg)
        setShow(true)
        showAlert("danger", errorMsg)
        toast.error(errorMsg)
        console.error("Login error:", error.response?.data || error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const navigateToRegister = () => {
    navigate("/register")
    window.scroll(0, 0)
  }

  const handleForgotPassword = () => {
    navigate("/ForgotPassword")
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
                <h1 className="mb-3 text-center loginheding">Welcome back!</h1>
                <p className="text-center">Already have an account? Sign in here!</p>

                {alertInfo.show && (
                  <Alert
                    variant={alertInfo.variant}
                    onClose={() => setAlertInfo({ ...alertInfo, show: false })}
                    dismissible
                  >
                    {alertInfo.message}
                  </Alert>
                )}

                <form>
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

                  <div className="buttomsapcec">
                    <label htmlFor="password" className="title-heading">
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="********"
                        className="custom-input"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSubmit()
                          }
                        }}
                      />
                      <FontAwesomeIcon
                        icon={showPassword ? faEye : faEyeSlash}
                        className="input-icon"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                    {errors.password && <p className="text-danger">{errors.password}</p>}
                  </div>

                  <div className="text-end mb-3">
                    <span onClick={handleForgotPassword} style={{ cursor: "pointer", color: "#007bff" }}>
                      Forgot password?
                    </span>
                  </div>

                  <div className="d-flex align-items-center justify-content-center">
                    <Button className="cutomebutton" onClick={handleSubmit}>
                      Sign In
                    </Button>
                  </div>

                  <div className="d-flex justify-content-center align-items-center mt-3">
                    <NavLink to="/register" onClick={navigateToRegister}>
                      <p>
                        Not a member? <span className="create-account pointer">Create an account.</span>
                      </p>
                    </NavLink>
                  </div>
                </form>
              </div>

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
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  )
}

export default Login
