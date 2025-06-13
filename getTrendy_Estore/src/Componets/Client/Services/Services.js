import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import "./Services.css";
import { TbPhoneCall } from "react-icons/tb";
import { RiSecurePaymentFill } from "react-icons/ri";
import { TbTruckReturn } from "react-icons/tb";
import { TbTruckDelivery } from "react-icons/tb";

const Services = () => {
  return (
    <>
      <Container fluid className="Services-Container">
        <Row className="service-row">
          <Col className="margin-btm">
            <div className="service-colum">
              <div>
                <span>
                  {" "}
                  <TbTruckDelivery className="icon service-icon" />
                </span>
              </div>
              <div>
                <strong className="ml-10">Faster Delivery</strong>
              </div>
            </div>
          </Col>
          <Col className="margin-btm">
            <div className="service-colum">
              <div>
                <span>
                  {" "}
                  <TbTruckReturn className="icon service-icon" />
                </span>
              </div>
              <div className="ml-10">
                <strong>5 Day's Return Policy </strong>
              </div>
            </div>
          </Col>
          <Col className="margin-btm">
            <div className="service-colum">
              <div>
                <span>
                  {" "}
                  <RiSecurePaymentFill className="icon service-icon" />
                </span>
              </div>
              <div className="ml-10">
                <strong>Secure Payments</strong>
              </div>
            </div>
          </Col>
          <Col className="margin-btm">
            <div className="service-colum">
              <div>
                <span>
                  {" "}
                  <TbPhoneCall className="icon service-icon" />
                </span>
              </div>
              <div className="ml-10">
                <strong>24 Hours Support</strong>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Services;
