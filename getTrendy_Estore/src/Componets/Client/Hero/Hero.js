import React from "react";
import "./Hero.css";
import Slider from "../Slider/Slider";
import AllProducts from "../AllProducts/AllProducts";
import ProductPage from "../ProductPage/ProductPage";
import Testimonials from "../Testimonials/Testimonials";
import Bestsellers from "../Bestsellers/Bestsellers";
import Services from "../Services/Services";
import Footer from "../Footer/Footer";
import Videogallery from "../Video-gallery/Videogallery";
import Categories from "../Categories/Categories";
import ProductCard from "../AllProducts/ProductCard";
import Subcategory from "../Subcategory/Subcategory";

const Hero = () => {
  return (
    <>
      <div className="mx-[300px] mt-[45px] hero-section">
        <div
          data-aos="fade-down"
          data-aos-duration="2000"
          data-aos-easing="ease-in-out"
          className="section-title"
        >
          <div className="section-line"></div>
          <div className="text-center">
            <h5>Shop by Category</h5>
            <h1>Stylish Tees for Every Occasion and More!</h1>
          </div>

          <div className="section-line"></div>
        </div>

        {/* <div
          data-aos="fade-right"
          data-aos-duration="1500"
          className="mt-[60px]"
        >
          <Slider />
        </div> */}
        <Categories />
      </div>
      {/* <AllProducts /> */}
      <ProductCard />
      {/* <ProductPage /> */}
      <Subcategory />
       <Bestsellers /> 
      <Services />
      {/* <Videogallery /> */}
      {/* <Testimonials /> */}
      <Footer />
    </>
  );
};

export default Hero;
