import React, { useState } from "react";
import "./MenuBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCircleUser,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

const MenuBar = () => {
  return (
    <>
      <div className="dashboard-header">
        <div className="logo pointer">
          <a href="/">
            {" "}
            <img src="/Images/Meat_logo.PNG" alt="Logo" />
          </a>
        </div>
        <div className="hamburger-menu">
          <div className="menu-icons">
            <div>
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            &nbsp; &nbsp; &nbsp;
            <div>
              <FontAwesomeIcon icon={faBell} />
            </div>{" "}
            &nbsp; &nbsp; &nbsp;
            <button className="hamburger-icon">
              <FontAwesomeIcon
                icon={faCircleUser}
                style={{ fontSize: "40px" }}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuBar;
