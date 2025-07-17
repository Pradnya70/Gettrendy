import React from "react";
import "./AboutUs.css";
import { LuChefHat } from "react-icons/lu";
import { TbBowlSpoon } from "react-icons/tb";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { FaRegSmileBeam } from "react-icons/fa";
import Footer from "../Footer/Footer";

const AboutUs = () => {
  return (
    <>
      <div>
        <div className="about-us-hero-section mb-96">
          <div className="hero-text-div rounded-3 mx-auto p-5">
            <h1 className="text-center mb-4">About Us</h1>
            <p className="text-center">
              At <a href="https://gettrendy.in/">GetTrendy.in</a>, fashion isn’t just about what you wear—it’s about
              making a statement. Founded by Mr. Prashant K and Leena Shinde,
              our mission is to bring stylish, high-quality, and affordable
              fashion to both men and women who love to stay ahead of trends.
            </p>
          </div>
        </div>
        <div className="our-mission-section row mx-auto column-gap-1 ">
          <div class="col-12 col-xl-5 ml-lg-0 mr-lg-auto ">
            <h2 className="mb-4 text-center text-xl-start">
              Stay Trendy with GET Trendy!
            </h2>
            <p>
              From effortlessly cool T-shirts and hoodies to bold and stylish
              jackets, we design apparel that blends comfort, confidence, and
              contemporary style. Whether you're dressing up for a casual day
              out or looking for a standout outfit, GetTrendy has the perfect
              look for you.
            </p>
            <p>
              With a strong focus on quality, craftsmanship, and customer
              satisfaction, we ensure that every piece reflects the latest
              fashion while keeping you comfortable all day long. Join the
              trendsetters—because when you wear GetTrendy, you don’t just
              follow trends, you create them.
            </p>
          </div>

          <div class="col-12 col-xl-6 mx-auto ml-xl-auto mr-xl-0">
            <img
              src="/Images/man.jpg"
              alt="imgs"
              className="rounded-3 img-fluid"
            />
          </div>
        </div>
        <div className="teams-work-section mx-auto mb-5 p-5">
          <h2 className="text-center mb-5">Our Features</h2>
          <div className="row column-gap-3 row-gap-3 feature-row justify-content-center">
            <div className="col d-flex flex-column align-items-center p-5 feature-box col-12 col-md-5 col-xl">
              <LuChefHat
                style={{ fontSize: "50px" }}
                className="mb-3 feature-icon"
              />
              <h5 className="text-center">High-Quality Products</h5>
            </div>
            <div className="col d-flex flex-column align-items-center p-5 feature-box col-12 col-md-5 col-xl">
              <TbBowlSpoon style={{ fontSize: "50px" }} className="mb-3" />
              <h5 className="text-center">Outstanding Customer Service</h5>
            </div>
            <div className="col d-flex flex-column align-items-center p-5 feature-box col-12 col-md-5 col-xl">
              <RiMoneyRupeeCircleLine
                style={{ fontSize: "50px" }}
                className="mb-3"
              />

              <h5 className="text-center">Value for Money</h5>
            </div>
            <div className="col d-flex flex-column align-items-center p-5 feature-box col-12 col-md-5 col-xl">
              <FaRegSmileBeam style={{ fontSize: "50px" }} className="mb-3" />

              <h5 className="text-center">Positive Reviews and Reputation</h5>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;
