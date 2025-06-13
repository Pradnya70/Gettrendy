import React, { useEffect, useState } from "react";
import { Carousel } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Import icons
import "bootstrap/dist/css/bootstrap.min.css";
import "./Testimonials.css";
import axios from "axios";
import { BASEURL } from "../Comman/CommanConstans";

const Testimonials = () => {
  const [limit, setLimit] = useState(15);
  const [page, setPage] = useState(1);
  const [allReview, setAllReview] = useState([]);

  const reviews = [
    {
      id: 1,
      name: "Anuj Narayan",
      rating: 4,
      description:
        "Absolutely love the quality of the T-shirts! The fabric is soft and breathable, perfect for Indian weather. The colors stay vibrant even after multiple washes. Highly recommend this website for anyone looking for comfort and style!",
    },
    {
      id: 2,
      name: "Aditya Nawlae",
      rating: 5,
      description:
        "Great collection with trendy designs! The material feels premium and is super comfortable for all-day wear. Their size guide is accurate, and delivery was on time. I’ve already ordered more!",
    },
    {
      id: 3,
      name: "Avinash Bajaj",
      rating: 5,
      description:
        "I’m impressed with the durability of these T-shirts. The stitching is top-notch, and the fabric feels so smooth on the skin. Ideal for casual outings and even for layering in cooler weather. Best value for money!",
    },
  ];
  const getAllReview = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "x-access-token": token,
      };
      const response = await axios.get(
        `${BASEURL}/customers/review?page=${page}&limit=${limit}`,
        { headers }
      );
      if (response) {
        setAllReview(response.data.rows);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllReview();
  }, []);
  return (
    <div className="container custom-testimonials-container-main mb-5">
      <div
        data-aos="fade-down"
        data-aos-duration="2000"
        data-aos-easing="ease-in-out"
        className="section-title mb-5"
      >
        <div className="section-line"></div>
        <div className="text-center">
          <h5>Customer Reviews</h5>
          <h1>Our Happy Customers</h1>
        </div>
        <div className="section-line"></div>
      </div>
      <Carousel prevIcon={<FaChevronLeft />} nextIcon={<FaChevronRight />}>
        {reviews.map((testimonial, index) => (
          <Carousel.Item key={index}>
            <div className="row custom-testimonial-slide">
              <div className="col-md-4 text-center">
                <div className="custom-testimonial-image">
                  <img
                    // src="https://shofy-grocery-next-js.vercel.app/_next/image?url=%2Fassets%2Fimages%2Fusers%2Fuser-4.jpg&w=256&q=75"
                    src="/Images/user.png"
                    alt={testimonial.name}
                  />
                </div>
              </div>
              <div className="col-md-8">
                <div className="custom-testimonial-content">
                  <div className="custom-testimonial-rating">
                    {"★".repeat(testimonial.rating)}
                  </div>
                  <p>{testimonial.description}</p>
                  <h4>{testimonial.name}</h4>
                </div>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default Testimonials;
