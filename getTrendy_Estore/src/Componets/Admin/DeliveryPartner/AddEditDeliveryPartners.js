"use client"

import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"
import { Button, Col, Container, Form, Row } from "react-bootstrap"
import { BASEURL, UserRoles } from "../../Client/Comman/CommanConstans"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const AddEditDeliveryPartners = () => {
  const navigate = useNavigate()
  const [deliveryID, setDeliveryID] = useState("")
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const handleBack = () => {
    window.history.back()
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
      newErrors.password = "Password must be 6 digits long"
      valid = false
    }

    setErrors(newErrors) // Set errors state
    setMessage("") // Clear any previous messages if validation fails
    return valid
  }

  const handleSubmit = async (e) => {
    if (validateForm()) {
      setLoading(true)

      const formData = new FormData()
      formData.append("email", email)
      formData.append("username", name)
      formData.append("mobile_number", phone)
      formData.append("password", password)
      formData.append("profile_pic", file)
      formData.append("user_role", UserRoles.DELIVERY_MAN)
      formData.append("accepted_policy", true)
      try {
        const response = await axios.post(BASEURL + "/accounts/register-deliveryman/nt/", formData)
        if (response) {
          navigate("/admin-delivery-partner")
          setMessage(response?.data?.message)
          setEmail("")
          setName("")
          setPassword("")
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
        const emailMessage = error?.response?.data?.message[0]
        const mobileMessage = error?.response?.data?.message[1]
        setMessage(emailMessage || mobileMessage || "Internal Server Error")
      }
    } else {
      console.log("Form is invalid.")
    }
  }

  // Handle file selection and preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)

    if (selectedFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target.result)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  return (
    <>
      <Container className="bg-filler">
        <Row className="py-3">
          <Row className="">
            <div className="text-start">
              <FontAwesomeIcon icon={faArrowLeft} className="backicon pointer mb-3" onClick={handleBack} />
            </div>
            <h1 className="mb-3">{deliveryID ? "Edit" : "Add"} Delivery Partner</h1>
            {message && <div className="alert alert-info">{message}</div>}
          </Row>
        </Row>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formProductName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  isInvalid={!!errors.name} // Check for error message, not value
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formProductEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formProductPhone">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formProductPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Row>
                <Col lg={8}>
                  <Form.Group className="mb-3" controlId="formProductImage">
                    <Form.Label>User Image</Form.Label>
                    <Form.Control type="file" onChange={handleFileChange} />
                  </Form.Group>
                </Col>
                <Col lg={4}>
                  {selectedImage && (
                    <div className="mt-3">
                      <img
                        src={selectedImage || "/placeholder.svg"}
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
        </Form>
        <Button className="btn btn-danger" onClick={handleSubmit} disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </Button>
      </Container>
    </>
  )
}

export default AddEditDeliveryPartners
