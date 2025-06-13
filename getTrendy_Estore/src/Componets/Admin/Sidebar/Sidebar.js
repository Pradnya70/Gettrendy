import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBagShopping,
  faBars,
  faCar,
  faContactBook,
  faGear,
  faLayerGroup,
  faList,
  faMotorcycle,
  faPenToSquare,
  faRightFromBracket,
  faStar,
  faStore,
  faTrash,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";
import { Button, Modal } from "react-bootstrap";
import { MdForklift } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";

function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const sidebarRef = useRef(null);
  const [show, setShow] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      if (window.innerWidth < 768) {
        setIsOpen(false); // Close sidebar on click outside in mobile view
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  const handleClose = () => {
    setShow(false);
  };

  return (
    <>
      {window.innerWidth < 768 && (
        <button className="sidebar-toggle-button" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      )}
      <div
        ref={sidebarRef}
        className={`custom-sidebar ${isOpen ? "open" : "closed"}`}
      >
        <div className="custom-sidebar-menu" style={{ background: "white" }}>
          <div className="logo pointer">
            <a href="/">
              {" "}
              <img
                src="/Images/Get_Trendy_Logo.png"
                alt="Logo"
                style={{
                  height: "100px",
                  width: "100px",
                  objectFit: "contain",
                }}
              />
            </a>
          </div>
          <div className="custom-sidebar-lighttext">
            <p>Inventory Management</p>
          </div>
          <NavLink
            to="/admin-store"
            className="custom-sidebar-item"
            activeClassName="active"
          >
            <FontAwesomeIcon icon={faStore} className="custom-sidebar-icon" />
            <span>Store</span>
          </NavLink>
          <NavLink
            to="/admin-allcategory"
            className="custom-sidebar-item"
            activeClassName="active"
          >
            <FontAwesomeIcon icon={faList} className="custom-sidebar-icon" />
            <span>All Category</span>
          </NavLink>
          <NavLink
            to="/admin-allsubcategory"
            className="custom-sidebar-item"
            activeClassName="active"
          >
            <FontAwesomeIcon
              icon={faLayerGroup}
              className="custom-sidebar-icon"
            />
            <span>All Sub Category</span>
          </NavLink>
          <NavLink
            to="/admin-allproducts"
            className="custom-sidebar-item"
            activeClassName="active"
          >
            <FontAwesomeIcon
              icon={faBagShopping}
              className="custom-sidebar-icon"
            />
            <span>All Products</span>
          </NavLink>
          <NavLink
            to="/admin-AllInventory"
            className="custom-sidebar-item"
            activeClassName="active"
          >
            <MdForklift className="custom-sidebar-icon" />
            <span>All Inventory</span>
          </NavLink>
          <NavLink
            to="/admin-orders"
            className="custom-sidebar-item"
            activeClassName="active"
          >
            <TbTruckDelivery className="custom-sidebar-icon" />
            <span>All Orders</span>
          </NavLink>
          <div className="custom-sidebar-lighttext mt-3">
            <p>User Management</p>
          </div>
          <NavLink
            to="/admin-users"
            className="custom-sidebar-item"
            activeClassName="active"
          >
            <FontAwesomeIcon icon={faUsers} className="custom-sidebar-icon" />
            <span>All Users</span>
          </NavLink>
          <NavLink
            to="/admin-reviews"
            className="custom-sidebar-item"
            activeClassName="active"
          >
            <FontAwesomeIcon icon={faStar} className="custom-sidebar-icon" />
            <span>Reviews</span>
          </NavLink>
          <NavLink
            to="/admin-conatctUs"
            className="custom-sidebar-item"
            activeClassName="active"
          >
            <FontAwesomeIcon
              icon={faContactBook}
              className="custom-sidebar-icon"
            />
            <span>All Contacts</span>
          </NavLink>
          <NavLink
            to="/admin-delivery-partner"
            className="custom-sidebar-item"
            activeClassName="active"
          >
            <FontAwesomeIcon
              icon={faMotorcycle}
              className="custom-sidebar-icon"
            />
            <span>Delivery Partner</span>
          </NavLink>
          <div className="mt-5">
            <div className="custom-sidebar-lighttext mt-3">
              <p>PROFILE</p>
            </div>
            <NavLink
              to="/#"
              className="custom-sidebar-item"
              activeClassName="active"
            >
              <FontAwesomeIcon icon={faGear} className="custom-sidebar-icon" />
              <span>Settings</span>
            </NavLink>
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="custom-sidebar-icon mt-2 pointer"
            />
            <span className="pointer" onClick={() => setShow(true)}>
              Logout
            </span>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to Logout?</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleLogout}>
            Ok
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Sidebar;
