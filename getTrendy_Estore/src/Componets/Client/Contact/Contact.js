import React, { useState } from "react";
import "./Contact.css"; // Import your CSS file for styling
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import Footer from "../Footer/Footer";
import axios from "axios";
import { BASEURL } from "../Comman/CommanConstans";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext/AuthContext";
import { Form } from "react-bootstrap";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    subject: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { userToken } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    let errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.message) errors.message = "Message is required";
    setErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setMessage("Please fill out all fields");
      toast.error("Please fill out all fields");
      return;
    }
    {
      const payload = {
        name: formData.name,
        email: formData.email,
        subject: formData.message,
        message: formData.subject,
      };

      try {
        const response = await axios.post(
          `${BASEURL}/products/contact`,
          payload,
          {
            headers: {
              "x-access-token": userToken,
            },
          }
        );
        if (response.data) {
          setMessage("Thank You For The Message");
          toast.success("Thank You For The Message");
          setFormData({
            name: "",
            email: "",
            message: "",
            subject: "",
          });
        }
      } catch (error) {
        setMessage("Failed to send Message");
        toast.error("Failed to send Message");
        console.error(error);
      }
    }
  };

  return (
    <>
      <div className="contact-container">
        <h1>Keep In Touch with Us</h1>
        <p>Home • Contact</p>

        <div className="contact-content">
          <div className="contact-form">
            <h2 className="text-start">Send A Message</h2>

            <Form onSubmit={handleSubmit}>
              <div className="form-group">
                <Form.Group className="mb-3" controlId="formProductName">
                  <label>Your Name</label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.name} // Show error state if there's an error
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="form-group">
                <Form.Group className="mb-3" controlId="formProductEmail">
                  <label>Your Email</label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email} // Same for email
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="form-group">
                <Form.Group className="mb-3" controlId="formProductSubject">
                  <label>Subject </label>
                  <Form.Control
                    type="text"
                    name="subject"
                    placeholder="Enter the subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    // No need for validation on subject
                  />
                </Form.Group>
              </div>

              <div className="form-group">
                <Form.Group className="mb-3" controlId="formProductMessage">
                  <label>Your Message</label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="message"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={handleInputChange}
                    isInvalid={!!errors.message} // Same for message
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <button type="submit" className="send-message-btn">
                Send Message
              </button>
            </Form>
          </div>

          <div className="contact-info">
            <div className="info-item">
              <img
                src="https://shofy-grocery-next-js.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcontact-icon-1.9066600e.png&w=64&q=75"
                alt="Contact Icon"
              />
              <p>prashhaant@gmail.com</p>
              <p>+91 9096321038</p>
            </div>
            <div className="info-item">
              <img
                src="https://shofy-grocery-next-js.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcontact-icon-2.7114edc9.png&w=96&q=75"
                alt="Address Icon"
              />
              <p>
                Flat No. 403, 4th Floor, B-wing, Saraswati Crystal, Opp. Silver
                Brich Hospital, Raikar Mala, Dhayari, Pune-411041
              </p>
            </div>
            <div className="info-item">
              <img
                src="https://shofy-grocery-next-js.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcontact-icon-3.a1ff7720.png&w=96&q=75"
                alt="Address Icon"
              />
              <p>Find on social media</p>
              <div className="social-icons">
                <a href="#">
                  <FaFacebook />
                </a>
                <a href="#">
                  <FaTwitter />
                </a>
                <a href="#">
                  <FaInstagram />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps location section */}
        <div className="location">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.961008264282!2d73.80372377864578!3d18.440079426884015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2951b6f003aa3%3A0x69aadb5d567f1123!2sSaraswati%20Crystals!5e0!3m2!1sen!2sin!4v1732709362552!5m2!1sen!2sin"
            width="600"
            height="450"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
      <Footer />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  );
};

export default Contact;
