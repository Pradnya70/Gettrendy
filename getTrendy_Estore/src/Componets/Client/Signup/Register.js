"use client"

import { useState } from "react"
import { Form, Button, Container, Row, Col, Modal } from "react-bootstrap"
import { NavLink, useNavigate } from "react-router-dom"
import "./LoginPage.css"
import { faEnvelope, faEye, faEyeSlash, faPhone, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from "axios"
import Loader from "../Loader/Loader"
import { useAuth } from "../../AuthContext/AuthContext"
import Footer from "../Footer/Footer"

function Register() {
  const { login } = useAuth()
  const [type, setType] = useState("password")
  const [type1, setType1] = useState("password")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("user") // Default role is user
  const [errors, setErrors] = useState({})
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [check, setCheck] = useState(true)

  const handleClose = () => {
    setShow(false)
  }
  const handleShow = () => setShow(true)

  const navigate = useNavigate()

  const togglePasswordVisibility = () => {
    setType(type === "password" ? "text" : "password")
  }

  const toggleConfirmPasswordVisibility = () => {
    setType1(type1 === "password" ? "text" : "password")
  }

  const validateForm = () => {
    let valid = true
    const newErrors = {}
    if (!name) {
      newErrors.name = "Name is required"
      valid = false
    }
    if (!email) {
      newErrors.email = "Email address is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid"
      valid = false
    }
    if (!phone) {
      newErrors.phone = "Phone Number is required"
      valid = false
    }
    if (!password) {
      newErrors.password = "Password is required"
      valid = false
    } else if (password.length < 6) {
      newErrors.password = "Password must be 6 digit long"
      valid = false
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required"
      valid = false
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setLoading(true)
      const formData = {
        name,
        email,
        phone,
        password,
        role,
      }

      try {
        const response = await axios.post("http://localhost:5000/api/auth/register", formData)

        console.log("Register response:", response.data)

        if (response) {
          const token = response?.data?.data?.token
          const userRole = response?.data?.data?.user?.role
          const userId = response?.data?.data?.user?.id
          const userName = response?.data?.data?.user?.name

          console.log("Registration successful:", { userRole, userId, userName })

          login(token, userRole, userId, userName)
          setMessage(response?.data?.message)
          handleShow()
          setEmail("")
          setName("")
          setPassword("")
          setConfirmPassword("")

          // Redirect based on role
          setTimeout(() => {
            console.log("Redirecting user with role:", userRole)
            if (userRole === "admin") {
              console.log("Redirecting to admin dashboard")
              navigate("/admin-dashboard")
            } else {
              console.log("Redirecting to user dashboard")
              navigate("/dashboard")
            }
          }, 1500)
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
        const errorMessage = error?.response?.data?.message || "Internal Server Error"
        setMessage(errorMessage)
        handleShow()
      }
    } else {
      console.log("Form is invalid.")
    }
  }

  const navigateTologin = () => {
    navigate("/login")
    window.scroll(0, 0)
  }

  return (
    <>
      {loading ? <Loader /> : ""}
      <Container fluid className="d-flex align-items-center justify-content-center Register-Container">
        <Container fluid>
          <Row className="">
            <Col
              className="d-flex flex-column align-items-center justify-content-center"
              style={{
                backgroundColor: "#FFFFFF",
                padding: "2rem",
                position: "relative",
              }}
            >
              <div className="login-form-container">
                <h1 className="mb-3 text-center loginheding">Welcome!</h1>
                <p className="text-center">Don't have an account? Create a free account.</p>
                <form onSubmit={handleSubmit}>
                  <div className="buttomsapcec">
                    <label htmlFor="name" className="title-heading">
                      Name
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        id="name"
                        placeholder="Enter your name"
                        className="custom-input"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                      />
                      <FontAwesomeIcon icon={faUser} className="input-icon" />
                    </div>
                    {errors.name && <p className="text-danger">{errors.name}</p>}
                  </div>
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
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                      />
                      <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    </div>
                    {errors.email && <p className="text-danger">{errors.email}</p>}
                  </div>
                  <div className="buttomsapcec">
                    <label htmlFor="phonenumber" className="title-heading">
                      Phone Number
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        id="phonenumber"
                        placeholder="Enter your Phone Number"
                        className="custom-input"
                        onChange={(e) => setPhone(e.target.value)}
                        value={phone}
                      />
                      <FontAwesomeIcon icon={faPhone} className="input-icon" />
                    </div>
                    {errors.phone && <p className="text-danger">{errors.phone}</p>}
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
                        value={password}
                      />
                      <FontAwesomeIcon
                        icon={type === "password" ? faEyeSlash : faEye}
                        className="input-icon pointer"
                        onClick={() => togglePasswordVisibility()}
                      />
                    </div>
                    {errors.password && <p className="text-danger">{errors.password}</p>}
                  </div>
                  <div className="buttomsapcec">
                    <label htmlFor="confirmpassword" className="title-heading">
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <input
                        type={type1}
                        id="confirmpassword"
                        placeholder="Enter your Confirm Password"
                        className="custom-input"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        value={confirmPassword}
                      />
                      <FontAwesomeIcon
                        icon={type1 === "password" ? faEyeSlash : faEye}
                        className="input-icon pointer"
                        onClick={toggleConfirmPasswordVisibility}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-danger">{errors.confirmPassword}</p>}
                  </div>

                  <div className="buttomsapcec">
                    <label className="title-heading">Account Type</label>
                    <div className="d-flex gap-4">
                      <label className="d-flex align-items-center">
                        <input
                          type="radio"
                          value="user"
                          checked={role === "user"}
                          onChange={() => setRole("user")}
                          className="me-2"
                        />
                        User
                      </label>
                      <label className="d-flex align-items-center">
                        <input
                          type="radio"
                          value="admin"
                          checked={role === "admin"}
                          onChange={() => setRole("admin")}
                          className="me-2"
                        />
                        Admin
                      </label>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check
                      type="checkbox"
                      label="I agree to the Terms and Conditions"
                      onChange={(e) => setCheck(e.target.checked)}
                      checked={check}
                    />
                  </div>
                  <div className="d-flex align-items-center justify-content-center">
                    <Button className="cutomebutton" type="submit">
                      Sign Up
                    </Button>
                  </div>
                  <div className="d-flex justify-content-center align-items-center mt-3">
                    <p>
                      Already have an account?{" "}
                      <NavLink to="/login" onClick={() => navigateTologin()}>
                        <span className="create-account pointer">Log in here.</span>
                      </NavLink>
                    </p>
                  </div>
                </form>
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
  )
}

export default Register
