import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import "./DeliveryHome.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruckArrowRight } from "@fortawesome/free-solid-svg-icons";
import { MdCancel, MdOutlinePendingActions } from "react-icons/md";
import { TbTruckReturn } from "react-icons/tb";
import Neworders from "../Neworders/Neworders";

const DeliveryHome = () => {
  return (
    <>
      <Container className="py-5">
        <Row>
          <Col md={3}>
            <div
              className="delivery-section boxsadow1"
              style={{ background: "#00FF001A" }}
            >
              <div className="text-center">
                <FontAwesomeIcon
                  icon={faTruckArrowRight}
                  className="delivery-icon"
                  style={{ color: "green" }}
                />
                <h5>Completed Delivery</h5>
                <h4>27</h4>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div
              className="delivery-section boxsadow"
              style={{ background: "#FFFF001A" }}
            >
              <div className="text-center">
                <MdOutlinePendingActions
                  className="delivery-icon"
                  style={{ color: "gray" }}
                />
                <h5>Pending Delivery</h5>
                <h4>15</h4>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div
              className="delivery-section boxsadow"
              style={{ background: "#FF00001A" }}
            >
              <div className="text-center">
                <MdCancel className="delivery-icon" style={{ color: "red" }} />
                <h5>Cancel Delivery</h5>
                <h4>10</h4>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div
              className="delivery-section boxsadow1"
              style={{ background: "#87CEEB1A" }}
            >
              <div className="text-center">
                <TbTruckReturn
                  className="delivery-icon"
                  style={{ color: "blue" }}
                />
                <h5>Return Delivery</h5>
                <h4>05</h4>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      <Neworders />
    </>
  );
};

export default DeliveryHome;
