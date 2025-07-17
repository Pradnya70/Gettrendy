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

const Store = () => {
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
      const response = await axios.delete(
        `${BASEURL}/products/add-store/${id}`,
        {
          headers: {
            "x-access-token": userToken,
          },
        }
      );
      if (response) {
        setMessage("record deleted successfully");
        handleClose1();
        getAllStore();
      }
    } catch (error) {
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
      headerName: "Store Name",
      field: "store_name",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Location",
      field: "store_address",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Store Admin",
      field: "store_admin",
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
            src={BASEURL + params.data.store_image}
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
      const response = await axios.get(
        `${BASEURL}/store-admin/store?page=${page}&limit=${limit}`,
        {
          headers: {
            "x-access-token": userToken,
          },
        }
      );
      if (response.data) {
        const dataWithSr = response.data.rows.map((item, index) => ({
          ...item,
          sr: (page - 1) * limit + index + 1,
        }));
        setAllStores(dataWithSr);
        setTotalPages(response.data.count);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (id) => {
    navigate("/admin-crudStore", { state: { storeId: id } });
  };
  useEffect(() => {
    getAllStore();
  }, [page, limit]);
  return (
    <>
      <div>
        <div className="">
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="backicon pointer mb-3"
            onClick={handleBack}
          />
          <div className="table-heading">
            <h1>All Store</h1>
            <p>
              View and manage all registered Store efficiently. Use the table
              below to access details, update Store, and control Store.
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
              onClick={() => navigate("/admin-crudStore")}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Store
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

export default Store;
