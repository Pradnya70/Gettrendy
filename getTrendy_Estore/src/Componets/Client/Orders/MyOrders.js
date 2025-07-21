"use client";

import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from "axios";
import { BASEURL, authUtils } from "../Comman/CommanConstans";
import Footer from "../Footer/Footer";
import { Pagination, Stack } from "@mui/material";
import { toast } from "react-toastify";

const MyOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const columnDefs = [
    {
      headerName: "Sr No",
      field: "sr",
      sortable: true,
      filter: true,
      width: 80,
    },
    {
      headerName: "Order ID",
      field: "_id",
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params) => (params.value ? params.value.slice(-8) : ""),
    },
    {
      headerName: "Items",
      field: "items",
      sortable: false,
      filter: false,
      width: 200,
      valueFormatter: (params) => {
        if (params.value && Array.isArray(params.value)) {
          return `${params.value.length} item(s)`;
        }
        return "0 items";
      },
    },
    {
      headerName: "Total Amount",
      field: "totalAmount",
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params) => `₹${params.value || 0}`,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      filter: true,
      width: 120,
    },
    {
      headerName: "Payment Method",
      field: "paymentMethod",
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: "Date",
      field: "date",
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString();
        }
        return "";
      },
    },
    {
      headerName: "Receipt",
      field: "orderId", // or "_id" if you want to use MongoDB's _id
      width: 150,
      cellRenderer: (params) => {
        // Use orderId if available, otherwise fallback to _id
        const orderId = params.data.orderId || params.data._id;
        return (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleDownloadReceipt(orderId)}
          >
            Download Receipt
          </button>
        );
      },
    },
  ];

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
  };

  const getAllOrders = async () => {
    try {
      setLoading(true);
      const token = authUtils.getToken();

      if (!token) {
        toast.error("Please login to view your orders");
        return;
      }

      const response = await axios.get(`${BASEURL}/api/orders/myorders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          limit,
        },
      });

      if (response.data) {
        console.log("Orders response:", response.data);

        let orders = [];
        if (Array.isArray(response.data)) {
          orders = response.data;
        } else if (
          response.data.orders &&
          Array.isArray(response.data.orders)
        ) {
          orders = response.data.orders;
        } else if (response.data.rows && Array.isArray(response.data.rows)) {
          orders = response.data.rows;
        }

        const dataWithSr = orders.map((item, index) => ({
          ...item,
          sr: (page - 1) * limit + index + 1,
        }));

        setAllOrders(dataWithSr);
        setTotalRows(response.data.count || orders.length);
        setTotalPages(
          response.data.pages_count || Math.ceil(orders.length / limit)
        );
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDownloadReceipt = (orderId) => {
    window.open(`${BASEURL}/api/orders/receipt/${orderId}`, "_blank");
  };

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      toast.warning("Please login to view your orders");
      return;
    }
    getAllOrders();
  }, [page, limit]);

  return (
    <>
      <div
        className="container"
        style={{ marginTop: "150px", marginBottom: "20px" }}
      >
        <div className="row">
          <h3 className="mb-3" style={{ fontWeight: "bold" }}>
            My Orders
          </h3>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div
                className="ag-theme-quartz"
                style={{ height: 500, width: "100%" }}
              >
                <AgGridReact
                  rowData={allOrders}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  pagination={false}
                  paginationPageSize={limit}
                  rowSelection="multiple"
                />
              </div>
              {totalPages > 1 && (
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
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
