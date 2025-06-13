import {
  faArrowLeft,
  faPenToSquare,
  faPlus,
  faSearch,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Pagination, Stack } from "@mui/material";
import { Button, Form, Modal } from "react-bootstrap";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useNavigate } from "react-router-dom";
import { BASEURL } from "../../Client/Comman/CommanConstans";
import axios from "axios";
import { useAuth } from "../../AuthContext/AuthContext";
import Loader from "../../Client/Loader/Loader";
import "./Orders.css";
import moment from "moment/moment";

const Orders = () => {
  const { userToken } = useAuth();
  const navigate = useNavigate();
  const [limit, setLimit] = useState(11);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allStores, setAllStores] = useState([]);
  const [id, setId] = useState(null);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [message, setMessage] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [allContacts, setAllContacts] = useState([]);
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [oderId, setOrderId] = useState(null);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleClose = () => setShow(false);
  const handleClose1 = () => setShow1(false);
  const handleClose2 = () => setShow2(false);
  const handleShow = () => setShow(true);

  const handleBack = () => {
    window.history.back();
  };

  const handleOpenDelete = (id) => {
    setId(id);
    handleShow();
  };

  const handleRowClick = (params) => {
    setSelectedOrder(params.data); // Set the clicked row's data to state
  };
  const handleDelete = async () => {
    try {
      handleClose();
      setLoading(true);
      const response = await axios.delete(
        `${BASEURL}/store-admin/orders/${id}`,
        {
          headers: {
            "x-access-token": userToken,
          },
        }
      );
      if (response) {
        setLoading(false);
        setMessage("record deleted successfully");
        handleClose1();
        getAllOrders();
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const columnDefs = [
    {
      headerName: "Sr No",
      field: "sr",
      sortable: true,
      filter: true,
      editable: false,
    },
    {
      headerName: "Name",
      field: "name",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Mobile Number",
      field: "mobile_number",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Amount",
      field: "amount",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Delivery Cost",
      field: "delivery_cost",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Delivery Address",
      field: "delivery_address",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Pin code",
      field: "pincode",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Payment Type",
      field: "payment_type",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Assign Order",
      field: "id",
      cellRenderer: (params) => (
        <>
          &nbsp;&nbsp;
          <img
            src="/Images/orderman.jpg"
            alt="public/Images/orderman.jpg"
            style={{ height: "30px", width: "30px" }}
            title="Assign Order"
            onClick={() => handleOpenAssignModel(params.value)}
          />
        </>
      ),
    },
    {
      headerName: "Action",
      field: "id",
      cellRenderer: (params) => (
        <>
          <FontAwesomeIcon
            icon={faPenToSquare}
            title="Edit"
            className="action-icon"
            onClick={() => handleEdit(params.value)}
          />
          &nbsp;&nbsp;
          <FontAwesomeIcon
            icon={faTrash}
            title="Delete"
            className="action-icon"
            onClick={() => handleOpenDelete(params.value)}
          />{" "}
        </>
      ),
    },
  ];
  const defaultColDef = {
    flex: 1,
    minWidth: 150,
    resizable: true,
  };

  const getAllOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/store-admin/orders?page=${page}&limit=${limit}`,
        {
          headers: {
            "x-access-token": userToken,
          },
        }
      );
      if (response.data) {
        setLoading(false);
        const dataWithSr = response.data.rows.map((item, index) => ({
          ...item,
          sr: (page - 1) * limit + index + 1,
        }));
        setAllStores(dataWithSr);
        setTotalRows(response.data.count);
        setTotalPages(response.data.pages_count);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleEdit = (id) => {
    navigate("/admin-inventoryCrud", { state: { inventoryId: id } });
  };

  const handleOpenAssignModel = (id) => {
    setOrderId(id);
    setShow2(true);
  };

  const getAllPartners = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "x-access-token": token,
      };
      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/store-admin/delivery-man?page=${page}&limit=${100}`,
        { headers }
      );
      if (response) {
        setLoading(false);
        setAllContacts(response.data.rows);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleSelect = (event) => {
    const selectedId = event.target.value;
    setDeliveryBoy(selectedId);
  };

  const handelAssignOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "x-access-token": token,
      };
      const payload = {
        delivery_boy: deliveryBoy,
      };
      const response = await axios.put(
        `${BASEURL}/store-admin/assign-order/${oderId}`,
        payload,
        { headers }
      );
      if (response.data) {
        handleClose2();
        setMessage("Order Assigned Successfully");
        setShow1(true);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllOrders();
    getAllPartners();
  }, [page, limit]);

  return (
    <>
      {loading ? <Loader /> : ""}
      <div>
        <div className="">
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="backicon pointer mb-3"
            onClick={handleBack}
          />
          <div className="table-heading">
            <h1>All Orders</h1>
            <p>
              View and manage all registered Orders efficiently. Use the table
              below to access details, update Orders, and control Orders.
            </p>
          </div>
        </div>
        <div className="mt-5 mb-3">
          <div>
            <strong>
              Note: Click on a row to view the order along with product details.{" "}
            </strong>
          </div>
        </div>
        <div
          className="ag-theme-quartz pointer"
          style={{ height: 500, width: "100%" }}
        >
          <AgGridReact
            rowData={allStores}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={false}
            paginationPageSize={limit}
            rowSelection="multiple"
            onRowClicked={handleRowClick}
            rowClass="pointer"
          />
        </div>
        <div className="mt-4 d-flex justify-content-center">
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              variant="outlined"
              className="custom-pagination"
            />
          </Stack>
        </div>
        {selectedOrder && (
          <div className="order-details-container">
            <div className="order-header">
              <span className="shipment-id">
                Order ID: {selectedOrder.order_id}
              </span>
              <span className="order-status">
                {selectedOrder.order_status === "Cancelled" && (
                  <span className="status-cancelled">Cancelled</span>
                )}
                {selectedOrder.order_status === "Pending" && (
                  <span className="status-cancelled">Pending</span>
                )}
              </span>
            </div>
            <div className="order-time">
              {moment(selectedOrder.created_on).format("D MMM YYYY, h:mm A")}
            </div>

            {/* Product List with Scrollable Container */}
            <div className="product-list">
              {selectedOrder.ordered_items.map((product, index) => (
                <div className="product-item" key={index}>
                  <img
                    className="product-image"
                    src={BASEURL + product.product_image}
                    alt={product.name}
                    width="60px"
                    height="60px"
                  />
                  <div className="product-info">
                    <div className="product-name">{product.product_name}</div>
                    <div className="product-details">
                      {product.weight} | ₹{product.product_price} | Qty.{" "}
                      {product.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <div className="order-total">
              <span>Total</span>
              <span className="total-price">₹{selectedOrder.amount}</span>
            </div>
          </div>
        )}
      </div>

      {/* alert model */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure want to delete?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>

      {/* success model */}
      <Modal show={show1} onHide={handleClose1}>
        <Modal.Header closeButton>
          <Modal.Title>Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose1}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={show2} onHide={handleClose2}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Label>Delivery Man</Form.Label>
            <Form.Select
              aria-label="Default select example"
              onChange={(e) => handleSelect(e)}
            >
              <option>Open this select menu</option>
              {allContacts &&
                allContacts.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.username}
                  </option>
                ))}
            </Form.Select>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => handelAssignOrder()}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Orders;
