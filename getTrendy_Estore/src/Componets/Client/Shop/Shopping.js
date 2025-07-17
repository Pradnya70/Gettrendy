import React, { useEffect, useState } from "react";
import "./Shop.css"; // Your custom CSS for additional styling
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { FaHeart } from "react-icons/fa";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Footer from "../Footer/Footer";
import axios from "axios";
import { BASEURL } from "../Comman/CommanConstans";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import { useCart } from "../../CartContext/CartContext";
import { useAuth } from "../../AuthContext/AuthContext";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const Shopping = () => {
  const { userToken } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [value, setValue] = useState([20, 37]);
  const [pagesCount, setPagesCount] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [inCartStatus, setInCartStatus] = useState({});
  const [allCategoryList, setAllCategoryList] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Track Pants",
      price: 49.0,
      image: "/Images/Slim-Fit Joggers.jpg",
      category: "Baby Food",
      rating: "★★★★★",
    },
    {
      id: 2,
      name: "Wristbands or Socks",
      price: 60.0,
      image: "/Images/Wristbands or Socks.jpg",
      category: "Strawberry",
      rating: "★★★★",
    },
    {
      id: 3,
      name: "Backpacks",
      price: 30.0,
      image: "/Images/Everyday Casual Backpack.jpg",
      category: "Meat",
      rating: "★★★★★",
    },
    // Add more products
  ]);

  function valuetext(value) {
    return `${value}°C`;
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getProductsById = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/customers/all-products?page=${page}&limit=${limit}&sub_category=${id}`
      );
      if (response) {
        setLoading(false);
        setAllProducts(response.data.rows);
        setPagesCount(response.data.pages_count);
        setTotalCount(response.data.count);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/customers/products?page=${page}&limit=${limit}`
      );
      if (response) {
        setLoading(false);
        setAllProducts(response.data.rows);
        setPagesCount(response.data.pages_count);
        setTotalCount(response.data.count);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scroll(0, 0);
  };

  // Calculate the range for the current page
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalCount);

  const navigateToProduct = (id) => {
    window.scroll(0, 0);
    navigate("/perticularproductpage", { state: { productId: id } });
  };
  const handleAddToCart = (product) => {
    if (userToken) {
      addToCart(product, 1);
      setInCartStatus((prevStatus) => ({
        ...prevStatus,
        [product.id]: true,
      }));
    } else {
      navigate("/login");
      window.scroll(0, 0);
    }
  };

  const truncateText = (text, limit) => {
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  const discountAmount = (price, rate) => {
    const amount = (price * rate) / 100;
    const originalPrice = price + amount;
    return originalPrice;
  };

  const getAllCategories = async () => {
    try {
      const response = await axios.get(
        `${BASEURL}/customers/subcategory-products?page=1&limit=100`,
        {
          headers: {
            "x-access-token": userToken || localStorage.getItem("token"),
          },
        }
      );
      if (response) {
        setAllCategoryList(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const showViewMore = allCategoryList.length > visibleCount;

  const handleViewMore = () => {
    setVisibleCount(allCategoryList.length);
  };
  const handleViewLess = () => {
    setVisibleCount(6);
  };

  const showProductsByCategory = (id) => {
    getProductsById(id);
  };
  const resetFilter = () => {
    getAllProducts();
  };
  const categoryID = location?.state?.category;
  useEffect(() => {
    if (categoryID) {
      getProductsById(categoryID);
    } else {
      getAllProducts();
    }
    getAllCategories();
  }, [page, limit, categoryID]);
  return (
    <>
      {loading ? <Loader /> : ""}
      <div className="shop-container">
        <div className="shop-sidebar">
          {/* <div className="price-filter" style={{ overflow: "hidden" }}>
            <h4>Price Filter</h4>
            <Box sx={{ width: 300 }}>
              <Slider
                getAriaLabel={() => "Temperature range"}
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                getAriaValueText={valuetext}
              />
            </Box>

            <div className="filter-actions">
              <p>
                ₹{value[0]} - ₹{value[1]}
              </p>
              <Button>Filter</Button>
            </div>
          </div> */}

          <div className="categories">
            <h4>Categories</h4>
            {allCategoryList && allCategoryList.length > 0 ? (
              <div>
                <ul>
                  {allCategoryList.slice(0, visibleCount).map((row) => (
                    <li
                      key={row.id}
                      className="pointer"
                      onClick={() => showProductsByCategory(row.id)}
                    >
                      {row.name}
                    </li>
                  ))}
                </ul>
                {showViewMore ? (
                  <Button
                    onClick={handleViewMore}
                    className="viewMoreButton mb-3"
                  >
                    View More <MdKeyboardArrowDown size={20} />
                  </Button>
                ) : (
                  <Button
                    onClick={handleViewLess}
                    className="viewMoreButton mb-3"
                  >
                    View Less <MdKeyboardArrowUp size={20} />
                  </Button>
                )}
              </div>
            ) : (
              <p>No Data found</p>
            )}
          </div>

          <div className="top-rated-products">
            <h4>Top Rated Products</h4>

            {products.map((row) => {
              return (
                <>
                  <div className="customs-shop-card">
                    <Row noGutters className="align-items-center g-5">
                      <Col xs={4} className="text-center">
                        <img
                          src={row.image}
                          alt="Product"
                          className="shop-img"
                        />
                      </Col>

                      <Col xs={8}>
                        <div className="product-card-desc">
                          <p className="rating">
                            {row.rating}{" "}
                            <span style={{ color: "black" }}>(5.0)</span>
                          </p>
                          <strong>{row.name}</strong>
                          <p className="card-text">$${row.price}</p>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </>
              );
            })}
          </div>
          <div className="top-rated-products mt-3">
            <h4>Reset Filter</h4>
            <Button
              style={{ background: "#E9272D" }}
              onClick={() => resetFilter()}
            >
              Reset Filter
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          <div className="sort-options">
            <span>{`Showing ${start}–${end} of ${totalCount} results`}</span>
          </div>

          <Row className="product-cards">
            {allProducts &&
              allProducts.map((product) => (
                <Col lg={3} md={6} sm={12} key={product.id} className="mb-5">
                  <Card className="shop-costume-product-card">
                    <div className="product-image-container">
                      <Card.Img
                        variant="top"
                        src={BASEURL + product.product_image}
                        alt="Product Image"
                        className="particular-product-image"
                      />
                      <FaHeart className="heart-icon" />
                      {inCartStatus[product.id] && (
                        <Badge className="added-to-cart-badge" bg="success">
                          Added to cart
                        </Badge>
                      )}
                    </div>
                    <Card.Body>
                      <Card.Text className="product-weight">
                        &nbsp;&nbsp;
                        {product.weight ? (
                          <span>• {product.weight} g</span>
                        ) : (
                          ""
                        )}{" "}
                        &nbsp;{" "}
                        {product.no_of_pices ? (
                          <span>• {product.no_of_pices} Pieces</span>
                        ) : (
                          ""
                        )}{" "}
                        &nbsp;
                        {product.serves ? (
                          <span>• {product.serves} Serves</span>
                        ) : (
                          ""
                        )}{" "}
                      </Card.Text>
                      <Card.Title className="product-title">
                        {product.product_name}
                      </Card.Title>
                      <Card.Text className="product-description">
                        {truncateText(product.description, 100)}
                      </Card.Text>
                      <div className="price-section">
                        <div>
                          <span className="price">₹{product.price}.00</span>
                          <span className="original-price">
                            ₹{discountAmount(product.price, 23)}.00
                          </span>
                        </div>
                        <div>
                          <span className="discount">23% Off</span>
                        </div>
                      </div>
                      <div className="button-section">
                        <Button
                          variant="outline-dark"
                          className="view-more-btn"
                          onClick={() => navigateToProduct(product.id)}
                        >
                          View More
                        </Button>
                        <Button
                          className="add-to-cart-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to cart
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
          <div className="text-start">
            <Stack spacing={2}>
              <Pagination
                count={pagesCount} // Total number of pages
                page={page} // Current page
                variant="outlined"
                shape="rounded"
                onChange={handlePageChange} // Handle page change
              />
            </Stack>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Shopping;
