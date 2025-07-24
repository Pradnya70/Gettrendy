"use client"
import { useEffect, useState } from "react"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
import axios from "axios"
import { BASEURL, authUtils, getImageUrl } from "../Comman/CommanConstans"
import Footer from "../Footer/Footer"
import { Pagination, Stack } from "@mui/material"
import { toast } from "react-toastify"

const MyOrders = () => {
  const [allOrders, setAllOrders] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)

  const columnDefs = [
    {
      headerName: "Sr No",
      field: "sr",
      sortable: true,
      filter: true,
      width: 80,
    },
    {
      headerName: "Product Images",
      field: "items",
      sortable: false,
      filter: false,
      width: 150,
      cellRenderer: (params) => {
        const items = params.value
        if (!items || !Array.isArray(items) || items.length === 0) {
          return (
            <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
              <img
                src="/placeholder.svg"
                alt="No products"
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            </div>
          )
        }

        // Show first product image, or multiple if there are multiple products
        const imagesToShow = items.slice(0, 3) // Show max 3 images

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              gap: "4px",
              flexWrap: "wrap",
            }}
          >
            {imagesToShow.map((item, index) => {
              // Get image from populated productId or fallback
              let imageUrl = "/placeholder.svg"

              if (item.productId && item.productId.images && item.productId.images.length > 0) {
                imageUrl = getImageUrl(item.productId.images[0])
              }

              return (
                <img
                  key={index}
                  src={imageUrl || "/placeholder.svg"}
                  alt={item.productName || "Product"}
                  style={{
                    width: 35,
                    height: 35,
                    objectFit: "cover",
                    borderRadius: 4,
                    border: "1px solid #ddd",
                  }}
                  onError={(e) => {
                    e.target.src = "/placeholder.svg"
                  }}
                />
              )
            })}
            {items.length > 3 && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginLeft: "4px",
                }}
              >
                +{items.length - 3}
              </span>
            )}
          </div>
        )
      },
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
      cellRenderer: (params) => {
        const items = params.value
        if (!items || !Array.isArray(items)) {
          return "0 items"
        }

        return (
          <div style={{ padding: "8px 0" }}>
            {items.map((item, index) => (
              <div key={index} style={{ marginBottom: "4px", fontSize: "12px" }}>
                <strong>{item.productName}</strong>
                <br />
                <span style={{ color: "#666" }}>
                  Qty: {item.quantity} | Size: {item.size} | Color: {item.color}
                </span>
                <br />
                <span style={{ color: "#28a745", fontWeight: "bold" }}>₹{item.price}</span>
              </div>
            ))}
          </div>
        )
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
      cellRenderer: (params) => {
        const status = params.value || params.data.orderStatus
        let badgeClass = "badge "

        switch (status) {
          case "delivered":
            badgeClass += "bg-success"
            break
          case "shipped":
            badgeClass += "bg-info"
            break
          case "processing":
            badgeClass += "bg-warning"
            break
          case "cancelled":
            badgeClass += "bg-danger"
            break
          default:
            badgeClass += "bg-secondary"
        }

        return <span className={badgeClass}>{status}</span>
      },
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
      field: "createdAt",
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params) => {
        if (params.value) {
          return new Date(params.value).toLocaleDateString()
        }
        return ""
      },
    },
    {
      headerName: "Tracking",
      field: "trackingNumber",
      width: 120,
      cellRenderer: (params) => {
        const trackingNumber = params.value
        if (trackingNumber) {
          return (
            <button
              className="btn btn-info btn-sm"
              onClick={() => handleTrackOrder(trackingNumber)}
              title="Track Order"
            >
              Track
            </button>
          )
        }
        return <span className="text-muted">N/A</span>
      },
    },
    {
      headerName: "Receipt",
      field: "orderId",
      width: 150,
      cellRenderer: (params) => {
        const orderId = params.data.orderId || params.data._id
        return (
          <button className="btn btn-primary btn-sm" onClick={() => handleDownloadReceipt(orderId)}>
            Download Receipt
          </button>
        )
      },
    },
  ]

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
  }

  const getAllOrders = async () => {
    try {
      setLoading(true)
      const token = authUtils.getToken()
      if (!token) {
        toast.error("Please login to view your orders")
        return
      }

      const response = await axios.get(`${BASEURL}/api/orders/myorders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          limit,
        },
      })

      if (response.data) {
        console.log("Orders response:", response.data)
        let orders = []
        if (Array.isArray(response.data)) {
          orders = response.data
        } else if (response.data.orders && Array.isArray(response.data.orders)) {
          orders = response.data.orders
        } else if (response.data.rows && Array.isArray(response.data.rows)) {
          orders = response.data.rows
        }

        const dataWithSr = orders.map((item, index) => ({
          ...item,
          sr: (page - 1) * limit + index + 1,
        }))

        setAllOrders(dataWithSr)
        setTotalRows(response.data.count || orders.length)
        setTotalPages(response.data.pages_count || Math.ceil(orders.length / limit))
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleDownloadReceipt = (orderId) => {
    window.open(`${BASEURL}/api/orders/receipt/${orderId}`, "_blank")
  }

  const handleTrackOrder = (trackingNumber) => {
    // You can integrate with Shiprocket tracking or redirect to courier website
    window.open(`https://shiprocket.in/tracking/${trackingNumber}`, "_blank")
  }

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      toast.warning("Please login to view your orders")
      return
    }
    getAllOrders()
  }, [page, limit])

  return (
    <>
      <div className="container" style={{ marginTop: "150px", marginBottom: "20px" }}>
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
              <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
                <AgGridReact
                  rowData={allOrders}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  pagination={false}
                  paginationPageSize={limit}
                  rowSelection="multiple"
                  rowHeight={80} // Increase row height to accommodate images
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
  )
}

export default MyOrders
