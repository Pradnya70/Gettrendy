import React, { useEffect, useState } from "react";
import { useCart } from "../../CartContext/CartContext";
import "./OrderSummary.css";
import { Row, Col, Button, Table } from "react-bootstrap";
import { BASEURL } from "../Comman/CommanConstans";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../AuthContext/AuthContext";

const OrderSummary = () => {
  const { cartItems } = useCart();
  const { userToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, serOrderData] = useState({});

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product_price * item.quantity,
    0
  );

  const getOrderData = async (id) => {
    try {
      const response = await axios.get(`${BASEURL}/orders/orders/${id}`, {
        headers: {
          "x-access-token": userToken,
        },
      });
      if (response.data) {
        serOrderData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const navigateToConfirmOrder = () => {
    navigate("/confirm-order", { state: { orderNumber: orderData?.order_id } });
  };
  useEffect(() => {
    const order_id = location?.state?.orderId;
    if (order_id) {
      getOrderData(order_id);
    }
  }, []);
  return (
    <>
      <div className="order-container">
        <Row className="my-4 box-shadow">
          <h3 className="text-center mb-5">Orders Summary</h3>
          <Col md={7}>
            <div className=" p-4 bg-white">
              <h4 style={{ fontWeight: "bold" }} className="mb-3">
                Cart Summary
              </h4>
              <div
                style={{ maxHeight: "500px", overflowY: "auto", width: "100%" }}
              >
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Row>
                            <Col md={4}>
                              <img
                                src={BASEURL + item.product_image}
                                alt={item.name}
                                style={{ width: "100px" }}
                              />
                            </Col>
                            <Col md={8}>
                              <p>{item.product_name}</p>
                            </Col>
                          </Row>
                        </td>
                        <td>₹{item.product_price}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <div className="mt-3">
                <h5 style={{ fontWeight: "bold" }}>
                  Total : &nbsp; ₹{subtotal.toFixed(2)}
                </h5>
              </div>
            </div>
          </Col>

          <Col md={5}>
            <div className=" p-4 bg-white">
              <h4 className="mb-4" style={{ fontWeight: "bold" }}>
                Address Information
              </h4>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Full Name:</strong>
                </Col>
                <Col md={8}>{orderData?.name}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Street Address:</strong>
                </Col>
                <Col md={8}>{orderData?.delivery_address}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Town/City:</strong>
                </Col>
                <Col md={8}>{orderData?.city}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Postcode/ZIP:</strong>
                </Col>
                <Col md={8}>{orderData?.pincode}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Phone:</strong>
                </Col>
                <Col md={8}>{orderData?.mobile_number}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Email:</strong>
                </Col>
                <Col md={8}>{orderData?.email}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Payment Type:</strong>
                </Col>
                <Col md={8}>CASH</Col>
              </Row>
              <Button
                className="btn bg-danger"
                onClick={() => navigateToConfirmOrder()}
              >
                place order
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default OrderSummary;
