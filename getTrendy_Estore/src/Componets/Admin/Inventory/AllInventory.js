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
import { Button, Modal } from "react-bootstrap";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useNavigate } from "react-router-dom";
import { BASEURL } from "../../Client/Comman/CommanConstans";
import axios from "axios";
import { useAuth } from "../../AuthContext/AuthContext";
import Loader from "../../Client/Loader/Loader";

const AllInventory = () => {
  const { userToken } = useAuth();
  const navigate = useNavigate();
  const [limit, setLimit] = useState(11);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allStores, setAllStores] = useState([]);
  const [id, setId] = useState(null);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [message, setMessage] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleClose = () => setShow(false);
  const handleClose1 = () => setShow1(false);
  const handleShow = () => setShow(true);

  const handleBack = () => {
    window.history.back();
  };

  const handleOpenDelete = (id) => {
    setId(id);
    handleShow();
  };

  const handleDelete = async () => {
    try {
      handleClose();
      setLoading(true);
      const response = await axios.delete(
        `${BASEURL}/store-admin/inventory/${id}`,
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
        getAllStore();
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
      headerName: "Product Name",
      field: "product_name",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Store",
      field: "store_name",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Stock",
      field: "stock",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Store Image",
      field: "store_image",
      sortable: true,
      filter: true,
      editable: true,
      cellRenderer: (params) => (
        <>
          <img
            src={BASEURL + params.data.product_image}
            alt="category_image"
            style={{ height: "50px", width: "50px" }}
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

  const getAllStore = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/store-admin/inventory?page=${page}&limit=${limit}`,
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
  useEffect(() => {
    getAllStore();
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
            <h1>All Inventory</h1>
            <p>
              View and manage all registered Inventory efficiently. Use the
              table below to access details, update Inventory, and control
              Inventory.
            </p>
          </div>
        </div>
        <div className="mt-5 mb-3 search-colum">
          {/* <div>
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input type="search" placeholder="Search" />
          </div> */}
          <div>
            <Button
              className="filter-btn"
              onClick={() => navigate("/admin-inventoryCrud")}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Inventory
            </Button>
          </div>
        </div>
        <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
          <AgGridReact
            rowData={allStores}
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

export default AllInventory;
