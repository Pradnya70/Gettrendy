import React, { useEffect } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Hero from "../Hero/Hero";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import Aos from "aos";
import "aos/dist/aos.css";

// Add import for auth context or use localStorage if that's how you store the role
// import { useAuth } from "../../AuthContext/AuthContext";

const Home = () => {
  const navigate = useNavigate();

  // Example: get role from localStorage (adjust if you use context)
  const userRole = localStorage.getItem("role");

  const navigateToShop = () => {
    navigate("/shop");
    window.scroll(0, 0);
  };

  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const items = [
    {
      image: "/Images/banner1.jpg",
    },
    {
      image: "/Images/banner2.jpg",
    },
    {
      image: "/Images/banner3.jpg",
    },
    {
      image: "/Images/banner4.jpg",
    },
    {
      image: "/Images/banner5.jpg",
    },
    {
      image: "/Images/banner6.jpg",
    },
  ];

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  return (
    <>
      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        arrows
        className="custom-carousel"
        containerClass="carousel-container"
        itemClass="carousel-item-padding-20-px"
      >
        {items.map((item, index) => (
          <div className="carousel-card" key={index} data-aos="fade-up">
            <img src={item.image} alt={`slide-${index}`} />
          </div>
        ))}
      </Carousel>
      {/* Admin Dashboard Button (only for admin) */}
      {/* Removed as per user request: admin dashboard button should only be in Navigation.js */}
      <Hero />
    </>
  );
};

export default Home;
