"use client";

import moment from "moment/moment";
import { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { api, BASEURL } from "../Comman/CommanConstans"; // adjust import as needed

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const state = location?.state;
    console.log("PaymentSuccess location.state:", state);
    if (state && state.orderId) {
      api
        .get(`${BASEURL}/api/orders/${state.orderId}`)
        .then((res) => {
          setOrderDetails({
            orderNumber: res.data.data.orderId,
            paymentId: state.paymentId,
            amount: res.data.data.totalAmount,
            // ...add more fields as needed
          });
        })
        .catch((err) => {
          // handle error, maybe redirect or show error message
        });
    }
  }, [location]);

  if (!location.state || !location.state.orderId) {
    return <div>No order found. Please check your orders page.</div>;
  }

  if (!orderDetails)
    return (
      <div>
        No order details found. Please do not refresh this page after payment.
      </div>
    );

  return (
    <Container className="my-5 text-center">
      <Row className="justify-content-center">
        <Col md={8}>
          <div
            className="box-shadow p-5 bg-white"
            style={{
              borderRadius: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="success-icon mb-4">
              <i className="fas fa-check-circle fa-4x text-success"></i>
            </div>

            <h2
              className="mb-4"
              style={{ fontWeight: "bold", color: "#28a745" }}
            >
              Payment Successful!
            </h2>

            <p className="lead mb-4">
              Thank you for your purchase! Your payment has been processed
              successfully and your order is now being prepared.
            </p>

            <div className="order-details bg-light p-4 rounded mb-4">
              <h4 className="mb-3" style={{ color: "#E9272D" }}>
                Order Details
              </h4>

              <div className="row text-left">
                <div className="col-md-6">
                  <p>
                    <strong>Order Number:</strong>
                  </p>
                  <p className="text-muted">{orderDetails.orderNumber}</p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Payment ID:</strong>
                  </p>
                  <p className="text-muted">{orderDetails.paymentId}</p>
                </div>
              </div>

              <div className="row text-left">
                <div className="col-md-6">
                  <p>
                    <strong>Amount Paid:</strong>
                  </p>
                  <p className="text-success font-weight-bold">
                    ₹{orderDetails.amount.toFixed(2)}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Payment Method:</strong>
                  </p>
                  <p className="text-muted">
                    <i className="fas fa-credit-card me-2"></i>
                    Razorpay (Online Payment)
                  </p>
                </div>
              </div>

              <div className="row text-left">
                <div className="col-md-6">
                  <p>
                    <strong>Order Date:</strong>
                  </p>
                  <p className="text-muted">
                    {moment(new Date()).format("DD-MM-YYYY, hh:mm A")}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Status:</strong>
                  </p>
                  <p className="text-info">
                    <i className="fas fa-clock me-2"></i>
                    Processing
                  </p>
                </div>
              </div>
            </div>

            <div className="alert alert-info mb-4">
              <i className="fas fa-info-circle me-2"></i>
              <strong>What's Next?</strong>
              <br />
              You will receive an email confirmation shortly with your order
              details. We'll notify you when your order is shipped.
            </div>

            <div className="action-buttons">
              <Button
                onClick={() => navigate("/myOrders")}
                className="btn btn-primary mx-2 mb-2"
                style={{ backgroundColor: "#E9272D", borderColor: "#E9272D" }}
              >
                <i className="fas fa-list me-2"></i>
                View My Orders
              </Button>

              <Button
                onClick={() => navigate("/shop")}
                className="btn btn-outline-primary mx-2 mb-2"
                style={{ borderColor: "#E9272D", color: "#E9272D" }}
              >
                <i className="fas fa-shopping-bag me-2"></i>
                Continue Shopping
              </Button>

              <Button
                onClick={() => navigate("/")}
                className="btn btn-outline-secondary mx-2 mb-2"
              >
                <i className="fas fa-home me-2"></i>
                Back to Home
              </Button>
            </div>

            <div className="mt-4 pt-4 border-top">
              <p className="text-muted mb-2">
                <i className="fas fa-headset me-2"></i>
                Need help? Contact our support team
              </p>
              <p className="text-muted">
                <i className="fas fa-envelope me-2"></i>
                support@gettrendy.com |
                <i className="fas fa-phone ms-3 me-2"></i>
                +91-XXXXXXXXXX
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default PaymentSuccess;
