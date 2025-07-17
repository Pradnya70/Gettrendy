"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useAuth } from "../../AuthContext/AuthContext";
import Loader from "../Loader/Loader";
import { Link, Navigate } from "react-router-dom";
import { axios, API_ENDPOINTS } from "../Comman/CommanConstans";
import { toast } from "react-toastify";

const UserDashboard = () => {
  const { userToken, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  // Get user's name from local storage if not available in auth context
  const userName = user?.name || localStorage.getItem("userName") || "User";

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch user's orders
        const ordersResponse = await axios.get(API_ENDPOINTS.ORDER.LIST, {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        if (ordersResponse.data && ordersResponse.data.rows) {
          setOrders(ordersResponse.data.rows.slice(0, 5)); // Get last 5 orders

          // Calculate stats
          const allOrders = ordersResponse.data.rows;
          setStats({
            totalOrders: allOrders.length,
            pendingOrders: allOrders.filter(
              (order) => order.status === "pending"
            ).length,
            completedOrders: allOrders.filter(
              (order) => order.status === "completed"
            ).length,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (userToken) {
      fetchUserData();
    }
  }, [userToken]);

  if (!userToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1>Welcome, {user?.name || "User"}!</h1>
          <p className="text-muted">Here's an overview of your account</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body className="text-center">
              <h3>{stats.totalOrders}</h3>
              <p className="mb-0">Total Orders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body className="text-center">
              <h3>{stats.pendingOrders}</h3>
              <p className="mb-0">Pending Orders</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body className="text-center">
              <h3>{stats.completedOrders}</h3>
              <p className="mb-0">Completed Orders</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Orders</h5>
              <Link to="/myOrders" className="btn btn-sm btn-primary">
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              {orders.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>{order.orderId}</td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              order.status === "completed"
                                ? "bg-success"
                                : order.status === "shipped"
                                ? "bg-info"
                                : "bg-warning"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>₹{order.totalAmount.toFixed(2)}</td>
                        <td>
                          <Link
                            to={`/order-Summary/${order._id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center">No orders found</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;
