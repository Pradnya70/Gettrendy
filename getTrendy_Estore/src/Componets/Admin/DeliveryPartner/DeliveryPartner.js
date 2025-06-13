import React, { useEffect, useState } from "react";
import Loader from "../../Client/Loader/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Pagination, Stack } from "@mui/material";
import axios from "axios";
import { BASEURL } from "../../Client/Comman/CommanConstans";
import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const DeliveryPartner = () => {
  const navigate = useNavigate();
  const [allContacts, setAllContacts] = useState([]);
  const [limit, setLimit] = useState(15);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0); // Total rows in the table
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [id, setId] = useState(null);
  const [message, setMessage] = useState("");

  const handleBack = () => {
    window.history.back();
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
      field: "username",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Email",
      field: "email",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Action",
      field: "id",
      cellRenderer: (params) => (
        <>
          <FontAwesomeIcon
            icon={faTrash}
            title="Delete"
            className="action-icon"
            onClick={() => handleOpenDelete(params.value)}
          />
        </>
      ),
    },
  ];
  const defaultColDef = {
    flex: 1,
    minWidth: 150,
    resizable: true,
  };
  const handleClose = () => setShow(false);
  const handleClose1 = () => setShow1(false);
  const handleShow = () => setShow(true);

  const handleOpenDelete = (id) => {
    setId(id);
    handleShow();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getAllPartners = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "x-access-token": token,
      };
      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/store-admin/delivery-man?page=${page}&limit=${limit}`,
        { headers }
      );
      if (response) {
        setLoading(false);
        const dataWithSr = response.data.rows.map((item, index) => ({
          ...item,
          sr: (page - 1) * limit + index + 1,
        }));
        setAllContacts(dataWithSr);
        setTotalRows(response.data.count);
        setTotalPages(response.data.pages_count);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleDelete = async () => {
    try {
      handleClose();
      const token = localStorage.getItem("token");

      const headers = {
        "x-access-token": token,
      };
      const response = await axios.delete(`${BASEURL}/accounts/user/${id}`, {
        headers,
      });
      if (response) {
        setMessage("record deleted successfully");
        handleClose1();
        getAllPartners();
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
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
            <h1>Delivery Partners</h1>
            <p>
              View and manage all Delivery Partners. Use the table below to
              access Delivery Partner.
            </p>
          </div>
          <div className="mt-5 mb-3 search-colum">
            <div>
              <Button
                className="filter-btn"
                onClick={() => navigate("/admin-deliveryPartner")}
              >
                <FontAwesomeIcon icon={faPlus} /> Add Delivery Partners
              </Button>
            </div>
          </div>
        </div>

        <div
          className="ag-theme-quartz" // Use the correct theme class
          style={{ height: 500, width: "100%" }}
        >
          <AgGridReact
            rowData={allContacts}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={false}
            paginationPageSize={limit}
            rowSelection="multiple"
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
    </>
  );
};

export default DeliveryPartner;
