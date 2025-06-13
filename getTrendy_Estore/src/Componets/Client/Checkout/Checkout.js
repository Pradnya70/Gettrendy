"use client";

import { useEffect, useState } from "react";
import "./Checkout.css";
import Footer from "../Footer/Footer";
import { BASEURL, authUtils, cartUtils, api } from "../Comman/CommanConstans";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    country: "India",
    address: "",
    apartment: "",
    city: "",
    state: "",
    postcode: "",
    phone: "",
    email: "",
    orderNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [shipping, setShipping] = useState(50);
  const [loading, setLoading] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((acc, item) => {
    const price =
      item.productId?.price || item.product_price || item.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const total = subtotal + shipping;

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (/^\d{0,10}$/.test(value)) {
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
          setErrors({ ...errors, [name]: "" });
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
      if (errors[name]) {
        setErrors({ ...errors, [name]: "" });
      }
    }
  };

  // Validation function
  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.address.trim())
      newErrors.address = "Street Address is required";
    if (!formData.city.trim()) newErrors.city = "Town/City is required";
    if (!formData.postcode.trim())
      newErrors.postcode = "Postcode/ZIP is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    return newErrors;
  };

  const getUserInfo = async () => {
    try {
      const token = authUtils.getToken();
      if (!token) return;

      console.log("Fetching user info...");
      const response = await api.get(`${BASEURL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("User info response:", response.data);

      if (response.data && response.data.success) {
        const userData = response.data.data || response.data;
        setFormData((prev) => ({
          ...prev,
          fullName: userData.name || "",
          phone: userData.phone || "",
          email: userData.email || "",
          postcode: userData.pincode || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      if (error.response?.status === 404) {
        console.log("User profile endpoint not found, using fallback data");
        setFormData((prev) => ({
          ...prev,
          fullName: authUtils.getUserName() || "",
          email: localStorage.getItem("userEmail") || "",
        }));
      }
    }
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const items = await cartUtils.fetchCartItems();
      console.log("Cart items for checkout:", items);
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast.error("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  // Initialize Razorpay payment
  const initializeRazorpayPayment = async () => {
    try {
      setLoading(true);

      // Create Razorpay order
      const orderResponse = await api.post(
        `${BASEURL}/api/razorpay/create-order`,
        {
          amount: total,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        },
        {
          headers: {
            Authorization: `Bearer ${authUtils.getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!orderResponse.data.success) {
        throw new Error("Failed to create payment order");
      }

      const { order, key_id } = orderResponse.data;

      // Prepare order items for database
      const orderItems = cartItems.map((item) => ({
        productId: item.productId?._id || item.productId,
        productName:
          item.productId?.product_name ||
          item.productId?.name ||
          item.product_name ||
          item.name,
        quantity: item.quantity,
        price: item.productId?.price || item.product_price || item.price,
        size: item.size || "M",
        color: item.color || "Default",
      }));

      const orderData = {
        items: orderItems,
        totalAmount: total,
        address: {
          fullName: formData.fullName,
          street: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          phone: formData.phone,
          email: formData.email,
          country: formData.country,
        },
        notes: formData.orderNotes,
      };

      // Razorpay options
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "GetTrendy",
        description: "Purchase from GetTrendy",
        order_id: order.id,
        handler: async (response) => {
          try {
            console.log("Payment successful:", response);

            // Verify payment on backend
            const verifyResponse = await api.post(
              `${BASEURL}/api/razorpay/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: orderData,
              },
              {
                headers: {
                  Authorization: `Bearer ${authUtils.getToken()}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (verifyResponse.data.success) {
              toast.success("Payment successful! Order placed.");

              // Clear cart
              await cartUtils.clearCart();

              // Navigate to success page with order details
              setTimeout(() => {
                navigate("/payment-success", {
                  state: {
                    orderNumber: verifyResponse.data.order._id,
                    paymentId: response.razorpay_payment_id,
                    amount: total,
                  },
                });
              }, 1000);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.postcode}`,
        },
        theme: {
          color: "#E9272D",
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal closed");
            setLoading(false);
          },
        },
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async (response) => {
        console.error("Payment failed:", response.error);

        try {
          await api.post(
            `${BASEURL}/api/razorpay/payment-failed`,
            {
              error: response.error,
              orderData: orderData,
            },
            {
              headers: {
                Authorization: `Bearer ${authUtils.getToken()}`,
                "Content-Type": "application/json",
              },
            }
          );
        } catch (error) {
          console.error("Error logging payment failure:", error);
        }

        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Error initializing payment:", error);
      let message = "Failed to initialize payment";

      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status === 401) {
        message = "Please login to make payment";
        navigate("/login");
      }

      toast.error(message);
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate();

    if (Object.keys(formErrors).length === 0) {
      if (cartItems.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      // Initialize Razorpay payment
      await initializeRazorpayPayment();
    } else {
      setErrors(formErrors);
      toast.error("Please fill in all required fields correctly");
    }
  };

  const getCountries = async () => {
    try {
      const response = await api.get("https://restcountries.com/v3.1/all");
      const countryList = response.data
        .map((country) => country.name.common)
        .sort();
      setCountries(countryList);
    } catch (error) {
      console.error("Error fetching country list: ", error);
      setCountries([
        "India",
        "United States",
        "United Kingdom",
        "Canada",
        "Australia",
      ]);
    }
  };

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      toast.warning("Please login to proceed with checkout");
      navigate("/login");
      return;
    }

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    getUserInfo();
    fetchCartItems();
    getCountries();

    return () => {
      // Cleanup script
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [navigate]);

  return (
    <>
      <ToastContainer />
      <div className="container checkout-page" style={{ paddingTop: "150px" }}>
        <h2>Checkout</h2>
        <p>Home &bull; Checkout</p>

        {loading && cartItems.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-5">
            <h3>Your cart is empty</h3>
            <p className="text-muted">
              Add some items to your cart to proceed with checkout.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/shop")}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-8">
              <div className="billing-details">
                <h3>Billing Details</h3>
                <form onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <div className="form-group">
                    <label>
                      Full Name <span className="require">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.fullName ? "is-invalid" : ""
                      }`}
                      placeholder="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                    {errors.fullName && (
                      <div className="invalid-feedback">{errors.fullName}</div>
                    )}
                  </div>

                  {/* Street Address */}
                  <div className="form-group">
                    <label>
                      Street Address <span className="require">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.address ? "is-invalid" : ""
                      }`}
                      placeholder="Street address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                    {errors.address && (
                      <div className="invalid-feedback">{errors.address}</div>
                    )}
                  </div>

                  {/* Apartment */}
                  <div className="form-group">
                    <label>Apartment, suite, unit (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Apartment, suite, unit"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                    />
                  </div>

                  {/* City */}
                  <div className="form-group">
                    <label>
                      Town / City <span className="require">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.city ? "is-invalid" : ""
                      }`}
                      placeholder="Town/City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                    {errors.city && (
                      <div className="invalid-feedback">{errors.city}</div>
                    )}
                  </div>

                  {/* State */}
                  <div className="form-group">
                    <label>State (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Postcode */}
                  <div className="form-group">
                    <label>
                      Postcode / ZIP <span className="require">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.postcode ? "is-invalid" : ""
                      }`}
                      placeholder="ZIP"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleChange}
                      required
                    />
                    {errors.postcode && (
                      <div className="invalid-feedback">{errors.postcode}</div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="form-group">
                    <label>
                      Phone <span className="require">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${
                        errors.phone ? "is-invalid" : ""
                      }`}
                      placeholder="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                    {errors.phone && (
                      <div className="invalid-feedback">{errors.phone}</div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label>
                      Email <span className="require">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      placeholder="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  {/* Country */}
                  <div className="form-group">
                    <label>Country</label>
                    <select
                      className="form-control"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    >
                      {countries.map((country, index) => (
                        <option key={index} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Order Notes */}
                  <div className="form-group">
                    <label>Order notes (optional)</label>
                    <textarea
                      className="form-control"
                      placeholder="Notes about your order"
                      name="orderNotes"
                      value={formData.orderNotes}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                </form>
              </div>
            </div>

            <div className="col-md-4">
              <div className="order-summary">
                <h3>Your Order</h3>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="text-bold">Product</th>
                        <th className="text-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, index) => {
                        const productName =
                          item.productId?.product_name ||
                          item.productId?.name ||
                          item.product_name ||
                          item.name;
                        const productPrice =
                          item.productId?.price ||
                          item.product_price ||
                          item.price ||
                          0;
                        return (
                          <tr key={index}>
                            <td>
                              {productName} x {item.quantity}
                              <br />
                              <small className="text-muted">
                                Size: {item.size}, Color: {item.color}
                              </small>
                            </td>
                            <td>
                              ₹{(productPrice * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <table className="table">
                  <tbody>
                    <tr>
                      <td>
                        <strong>Subtotal</strong>
                      </td>
                      <td>₹{subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Shipping</strong>
                      </td>
                      <td>
                        <div>
                          <label>
                            <input
                              type="radio"
                              name="shipping"
                              value="flat"
                              checked={shipping === 50}
                              onChange={() => setShipping(50)}
                            />{" "}
                            Flat rate: ₹50.00
                          </label>
                          <br />
                          <label>
                            <input
                              type="radio"
                              name="shipping"
                              value="local"
                              checked={shipping === 25}
                              onChange={() => setShipping(25)}
                            />{" "}
                            Local pickup: ₹25.00
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Payment Method</strong>
                      </td>
                      <td>
                        <div className="payment-info">
                          <i
                            className="fas fa-credit-card"
                            style={{ color: "#E9272D", marginRight: "8px" }}
                          ></i>
                          <span>Secure Online Payment via Razorpay</span>
                          <br />
                          <small className="text-muted">
                            Supports Credit/Debit Cards, UPI, Net Banking,
                            Wallets
                          </small>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-bold">Total</td>
                      <td className="text-bold">₹{total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                <button
                  className="btn w-100"
                  style={{ background: "#E9272D", color: "white" }}
                  onClick={handleSubmit}
                  disabled={loading || cartItems.length === 0}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock me-2"></i>
                      Pay Securely ₹{total.toFixed(2)}
                    </>
                  )}
                </button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    <i className="fas fa-shield-alt me-1"></i>
                    Your payment information is secure and encrypted
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
