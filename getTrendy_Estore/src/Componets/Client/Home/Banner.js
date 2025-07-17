import React from "react";
import "./Banner.css";

const Banner = () => {
  return (
    <div className="banner-container">
      <div className="row align-items-center">
        {/* Left Section */}
        <div className="col-md-6 text-section">
          <h4>ONLY THIS WEEKEND</h4>
          <h1 className="sale-heading">FASHION SALE</h1>
          <p className="discount-text">DISCOUNT UP TO 50% OFF</p>
          <p className="description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed diam
            nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
            volutpat.
          </p>
          <button className="btn btn-warning shop-now-btn">Shop Now</button>
        </div>

        {/* Right Section */}
        <div className="col-md-6">
          <div className="image-section">
            <img
              src="/Images/Breast Boneless.jpg" // Replace with your image URL
              alt="Fashion Sale"
              className="img-fluid"
            />
            <div className="date-section">
              <span>AUG</span>
              <span className="date">18</span>
              <span className="date-end">05 SEP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
