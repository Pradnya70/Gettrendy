import React, { useEffect, useState } from "react";
import {
  faArrowLeft,
  faPenToSquare,
  faPlus,
  faSearch,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from "axios";
import { BASEURL } from "../../Client/Comman/CommanConstans";
import { Pagination, Stack, useStepContext } from "@mui/material";
import Loader from "../../Client/Loader/Loader";
import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AllProducts = () => {
  const navigate = useNavigate();
  const [allCars, setAllCars] = useState([]);
  const [limit, setLimit] = useState(20);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0); // Total rows in the table
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [id, setId] = useState(null);
  const [message, setMessage] = useState("");

  const handleClose = () => setShow(false);
  const handleClose1 = () => setShow1(false);
  const handleShow = () => setShow(true);

  const handleOpenDelete = (id) => {
    setId(id);
    handleShow();
  };

  const handleDelete = async () => {
    try {
      handleClose();
      const response = await axios.delete(
        `${BASEURL}/customers/products/${id}`
      );
      if (response) {
        setMessage("record deleted successfully");
        handleClose1();
        getAllCategory();
      }
    } catch (error) {
      console.log(error);
    }
  };
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
      headerName: "Main Category Name",
      field: "sub_category_name",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "Product Name",
      field: "product_name",
      sortable: true,
      filter: true,
      editable: true,
    },
    {
      headerName: "No Of Pieces / Count",
      field: "no_of_pices",
      sortable: true,
      filter: true,
      editable: true,
      cellRenderer: (params) => {
        return params.value ? params.value : "-";
      },
    },
    {
      headerName: "Weight",
      field: "weight",
      sortable: true,
      filter: true,
      editable: true,
      cellRenderer: (params) => {
        return params.value ? params.value : "-";
      },
    },
    {
      headerName: "Product Image",
      field: "category_image",
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
      headerName: "Product Description",
      field: "description",
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

  const getAllCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "x-access-token": token,
      };
      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/api/products?page=${page}&limit=${limit}`,
        { headers }
      );
      if (response) {
        setLoading(false);
        const dataWithSr = response.products.map((item, index) => ({
          ...item,
          sr: (page - 1) * limit + index + 1,
        }));
        setAllCars(dataWithSr);
        setTotalRows(response.data.count);
        setTotalPages(response.data.pages_count);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleEdit = (id) => {
    navigate("/admin-product", { state: { productId: id } });
  };
  useEffect(() => {
    getAllCategory();
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
            <h1>All Products</h1>
            <p>
              View and manage all registered Products efficiently. Use the table
              below to access details, update Products, and control Products.
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
              onClick={() => navigate("/admin-product")}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Products
            </Button>
          </div>
        </div>
        <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
          <AgGridReact
            rowData={allCars}
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

export default AllProducts;
