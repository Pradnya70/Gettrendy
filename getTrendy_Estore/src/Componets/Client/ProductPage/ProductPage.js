import React from "react";
import "./ProductPage.css"; // Custom CSS for extra styling
import { Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ProductPage = () => {
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("/shop");
    window.scroll(0, 0);
  };
  return (
    <div className="container my-5 ProductPage-container">
      <div className="row">
        {/* Left Section */}
        <div className="col-lg-4 col-md-12">
          <div className="promo-banner">
            <h4>Weekend Sales</h4>
            <h2>Get Up to 26% Off on Weekend!</h2>
            <button
              className="btn mt-3"
              style={{ background: "#E9272D", color: "white" }}
              onClick={() => handleNavigate()}
            >
              Shop Now
            </button>{" "}
            <br />
            <img
              src="/Images/tshirt5.png"
              alt="Vegetable Bag"
              className="img-fluid mt-3"
            />
          </div>
        </div>

        {/* Right Section - Products */}
        <div className="col-lg-4 col-md-6 mt-3">
          <h3 className="hading">Top Selling Products</h3>
          <div className="customs-product-card">
            <Row>
              <Col>
                <img
                  src="/Images/hat2.png"
                  alt="Product"
                  className="product-img"
                />
              </Col>
              <Col>
                <div className="product-card-desc">
                  <p className="rating">★★★★★</p>
                  <small>Headwear</small>
                  <strong>Classic Baseball Hat</strong>
                  <small>
                    Comfortable, adjustable, and perfect for everyday wear.
                  </small>
                </div>
              </Col>
            </Row>
          </div>
          <div className="customs-product-card">
            <Row>
              <Col>
                <img
                  src="/Images/Premium.png"
                  alt="Product"
                  className="product-img"
                />
              </Col>
              <Col>
                <div className="product-card-desc">
                  <p className="rating">★★★★★</p>
                  <small>Premium T-Shirts</small>
                  <strong>Luxury Cotton T-Shirt</strong>
                  <small>
                    Perfect blend of style and comfort for casual outings or
                    layering.
                  </small>
                </div>
              </Col>
            </Row>
          </div>
          <div className="customs-product-card">
            <Row>
              <Col>
                <img
                  src="/Images/Hoodies.png"
                  alt="Product"
                  className="product-img"
                />
              </Col>
              <Col>
                <div className="product-card-desc">
                  <p className="rating">★★★★★</p>
                  <small>Hoodies</small>
                  <strong>Cozy Graphic Hoodie</strong>
                  <small>
                    Stay warm and stylish with our comfortable hoodies.
                  </small>
                  {/* <p className="card-text">₹30.00</p> */}
                </div>
              </Col>
            </Row>
          </div>
        </div>

        <div className="col-lg-4 col-md-6 mt-3">
          <h3 className="hading">Top Rated Products</h3>
          <div className="customs-product-card">
            <Row>
              <Col>
                <img
                  src="/Images/Slim-Fit Joggers.jpg"
                  alt="Product"
                  className="product-img"
                />
              </Col>
              <Col>
                <div className="product-card-desc">
                  <p className="rating">★★★★★</p>
                  <small>Track Pants</small>
                  <strong>Slim-Fit Joggers</strong>
                  <small>
                    Perfect for workouts or lounging with a sleek, modern fit.
                  </small>
                </div>
              </Col>
            </Row>
          </div>
          <div className="customs-product-card">
            <Row>
              <Col>
                <img
                  src="/Images/Wristbands or Socks.jpg"
                  alt="Product"
                  className="product-img"
                />
              </Col>
              <Col>
                <div className="product-card-desc">
                  <p className="rating">★★★★★</p>
                  <small>Accessories</small>
                  <strong>Wristbands or Socks</strong>
                  <small>
                    {" "}
                    Small accessories that complete your outfit effortlessly.
                  </small>
                </div>
              </Col>
            </Row>
          </div>
          <div className="customs-product-card">
            <Row>
              <Col>
                <img
                  src="/Images/Everyday Casual Backpack.jpg"
                  alt="Product"
                  className="product-img"
                />
              </Col>
              <Col>
                <div className="product-card-desc">
                  <p className="rating">★★★★★</p>
                  <small>Backpacks</small>
                  <strong>Everyday Casual Backpack</strong>
                  <small>
                    Durable and stylish, perfect for work, travel, or daily
                    essentials.
                  </small>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
