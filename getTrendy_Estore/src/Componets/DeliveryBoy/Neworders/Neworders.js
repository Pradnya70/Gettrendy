import React, { useEffect, useState } from "react";
import {
  MDBCard,
  MDBCardTitle,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBBtn,
} from "mdb-react-ui-kit";
import { Col, Container, Row } from "react-bootstrap";
import axios from "axios";
import { BASEURL } from "../../Client/Comman/CommanConstans";
import { useAuth } from "../../AuthContext/AuthContext";

const Neworders = () => {
  const { userToken } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);

  const getAllOrders = async () => {
    try {
      const response = await axios.get(
        `${BASEURL}/delivery-man/my-orders?page=${page}&limit=${limit}`,
        {
          headers: {
            "x-access-token": userToken,
          },
        }
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);
  return (
    <>
      <Container>
        <div className="order-heading">
          <h4 style={{ fontWeight: "bold" }}>New Orders</h4>
          <div>
            <input
              type="date"
              onChange={(e) => setDate(e.target.value)}
              value={date}
            />
          </div>
        </div>
        <hr />
        <Row>
          <Col md={6}>
            <MDBCard style={{ maxWidth: "540px" }}>
              <MDBRow className="g-0">
                <MDBCol md="4">
                  <MDBCardImage
                    src="https://mdbootstrap.com/wp-content/uploads/2020/06/vertical.webp"
                    alt="..."
                    fluid
                  />
                </MDBCol>
                <MDBCol md="8">
                  <MDBCardBody className="text-start">
                    <MDBCardTitle>Country Egg</MDBCardTitle>
                    <MDBCardTitle>Joan Haris</MDBCardTitle>
                    <MDBCardText className="mt-3">
                      {" "}
                      <strong>
                        Akshya Nagar 1st Block 1st Cross, Rammurthy nagar,
                        Bangalore-560016
                      </strong>
                    </MDBCardText>
                    <MDBCardText className="mt-2">
                      <strong> +91 7820964512</strong>
                    </MDBCardText>
                    <MDBCardText>
                      <small className="text-muted">₹120.00</small>
                    </MDBCardText>
                    <div className="mt-2">
                      <MDBBtn>Accept</MDBBtn> &nbsp;
                      <MDBBtn style={{ background: "#E9272D" }}>Reject</MDBBtn>
                    </div>
                  </MDBCardBody>
                </MDBCol>
              </MDBRow>
            </MDBCard>
          </Col>
          <Col md={6}>
            <MDBCard style={{ maxWidth: "540px" }}>
              <MDBRow className="g-0">
                <MDBCol md="4">
                  <MDBCardImage
                    src="https://mdbootstrap.com/wp-content/uploads/2020/06/vertical.webp"
                    alt="..."
                    fluid
                  />
                </MDBCol>
                <MDBCol md="8">
                  <MDBCardBody className="text-start">
                    <MDBCardTitle>Country Egg</MDBCardTitle>
                    <MDBCardTitle>Joan Haris</MDBCardTitle>
                    <MDBCardText className="mt-3">
                      {" "}
                      <strong>
                        Akshya Nagar 1st Block 1st Cross, Rammurthy nagar,
                        Bangalore-560016
                      </strong>
                    </MDBCardText>
                    <MDBCardText className="mt-2">
                      <strong> +91 7820964512</strong>
                    </MDBCardText>
                    <MDBCardText>
                      <small className="text-muted">₹120.00</small>
                    </MDBCardText>
                    <div className="mt-2">
                      <MDBBtn>Accept</MDBBtn> &nbsp;
                      <MDBBtn style={{ background: "#E9272D" }}>Reject</MDBBtn>
                    </div>
                  </MDBCardBody>
                </MDBCol>
              </MDBRow>
            </MDBCard>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Neworders;
