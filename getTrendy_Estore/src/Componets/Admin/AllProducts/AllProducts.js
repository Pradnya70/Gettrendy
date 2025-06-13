"use client"

import { useEffect, useState } from "react"
import { faArrowLeft, faPenToSquare, faPlus, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
import axios from "axios"
import { BASEURL } from "../../Client/Comman/CommanConstans"
import { Pagination, Stack } from "@mui/material"
import Loader from "../../Client/Loader/Loader"
import { Button, Modal, Form, Row, Col, Badge } from "react-bootstrap"
import { useNavigate } from "react-router-dom"

const AdminProducts = () => {
  const navigate = useNavigate()
  const [allProducts, setAllProducts] = useState([])
  const [limit, setLimit] = useState(15)
  const [page, setPage] = useState(1)
  const [totalRows, setTotalRows] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [id, setId] = useState(null)
  const [message, setMessage] = useState("")
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    size: "",
    color: "",
    minPrice: "",
    maxPrice: "",
    search: "",
    featured: "",
    bestseller: "",
  })
  const [availableSizes, setAvailableSizes] = useState([])
  const [availableColors, setAvailableColors] = useState([])

  const handleClose = () => setShow(false)
  const handleCloseSuccess = () => setShowSuccess(false)
  const handleShow = () => setShow(true)

  const handleBack = () => {
    window.history.back()
  }

  const handleDelete = async () => {
    try {
      handleClose()
      const token = localStorage.getItem("token")

      const headers = {
        Authorization: `Bearer ${token}`,
      }
      const response = await axios.delete(`${BASEURL}/api/products/${id}`, { headers })
      if (response) {
        setMessage("Product deleted successfully")
        setShowSuccess(true)
        getAllProducts()
      }
    } catch (error) {
      console.log(error)
      setMessage("Error deleting product: " + (error.response?.data?.message || error.message))
      setShowSuccess(true)
    }
  }

  const handleOpenDelete = (id) => {
    setId(id)
    handleShow()
  }

  const handleEdit = (id) => {
    navigate("/admin-product", { state: { productId: id } })
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const applyFilters = () => {
    setPage(1)
    getAllProducts()
  }

  const resetFilters = () => {
    setFilters({
      category: "",
      subcategory: "",
      size: "",
      color: "",
      minPrice: "",
      maxPrice: "",
      search: "",
      featured: "",
      bestseller: "",
    })
    setPage(1)
    getAllProducts()
  }

  const columnDefs = [
    {
      headerName: "Sr No",
      field: "sr",
      sortable: true,
      filter: true,
      editable: false,
      width: 80,
    },
    {
      headerName: "Images",
      field: "images",
      sortable: false,
      filter: false,
      editable: false,
      width: 120,
      cellRenderer: (params) => {
        const images = params.value
        if (images && images.length > 0) {
          return (
            <div className="d-flex gap-1 align-items-center" style={{ height: "60px", overflow: "hidden" }}>
              {images.slice(0, 3).map((img, index) => (
                <img
                  key={index}
                  src={BASEURL + img || "/placeholder.svg"}
                  alt={`Product ${index + 1}`}
                  style={{
                    height: "50px",
                    width: "50px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              ))}
              {images.length > 3 && <span className="text-muted small">+{images.length - 3}</span>}
            </div>
          )
        }
        return <div>No Image</div>
      },
    },
    {
      headerName: "Product Name",
      field: "product_name",
      sortable: true,
      filter: true,
      editable: false,
    },
    {
      headerName: "Category",
      field: "category.category_name",
      sortable: true,
      filter: true,
      editable: false,
    },
    {
      headerName: "Price",
      field: "price",
      sortable: true,
      filter: true,
      editable: false,
      valueFormatter: (params) => {
        return `$${params.value.toFixed(2)}`
      },
    },
    {
      headerName: "Stock",
      field: "stock",
      sortable: true,
      filter: true,
      editable: false,
      width: 100,
    },
    {
      headerName: "Status",
      field: "status",
      sortable: false,
      filter: false,
      editable: false,
      width: 120,
      cellRenderer: (params) => {
        const { featured, Bestseller } = params.data
        return (
          <div className="d-flex flex-column gap-1">
            {featured && (
              <Badge bg="primary" size="sm">
                Featured
              </Badge>
            )}
            {Bestseller && (
              <Badge bg="success" size="sm">
                Bestseller
              </Badge>
            )}
            {!featured && !Bestseller && (
              <Badge bg="secondary" size="sm">
                Regular
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      headerName: "Sizes",
      field: "sizes",
      sortable: false,
      filter: false,
      editable: false,
      cellRenderer: (params) => {
        const sizes = params.value
        if (sizes && sizes.length > 0) {
          return sizes.join(", ")
        }
        return "N/A"
      },
    },
    {
      headerName: "Colors",
      field: "colors",
      sortable: false,
      filter: false,
      editable: false,
      cellRenderer: (params) => {
        const colors = params.value
        if (colors && colors.length > 0) {
          return colors.join(", ")
        }
        return "N/A"
      },
    },
    {
      headerName: "Action",
      field: "_id",
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
      width: 100,
    },
  ]

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
  }

  const getAllProducts = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
      }
      setLoading(true)

      // Build query string with filters
      let queryParams = `page=${page}&limit=${limit}`
      if (filters.category) queryParams += `&category=${filters.category}`
      if (filters.subcategory) queryParams += `&subcategory=${filters.subcategory}`
      if (filters.size) queryParams += `&size=${filters.size}`
      if (filters.color) queryParams += `&color=${filters.color}`
      if (filters.minPrice) queryParams += `&minPrice=${filters.minPrice}`
      if (filters.maxPrice) queryParams += `&maxPrice=${filters.maxPrice}`
      if (filters.search) queryParams += `&search=${filters.search}`
      if (filters.featured) queryParams += `&featured=${filters.featured}`
      if (filters.bestseller) queryParams += `&bestseller=${filters.bestseller}`

      const response = await axios.get(`${BASEURL}/api/products?${queryParams}`, { headers })

      if (response) {
        setLoading(false)
        const dataWithSr = response.data.rows.map((item, index) => ({
          ...item,
          sr: (page - 1) * limit + index + 1,
        }))
        setAllProducts(dataWithSr)
        setTotalRows(response.data.count)
        setTotalPages(response.data.pages_count)
      }
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const getCategories = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
      }
      const response = await axios.get(`${BASEURL}/api/category?limit=100`, { headers })
      if (response) {
        setCategories(response.data.rows)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getSubcategories = async (categoryId = "") => {
    try {
      const token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
      }
      let url = `${BASEURL}/api/subcategory?limit=100`
      if (categoryId) {
        url += `&category=${categoryId}`
      }
      const response = await axios.get(url, { headers })
      if (response) {
        setSubcategories(response.data.rows)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getProductFilters = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
      }
      const response = await axios.get(`${BASEURL}/api/products/filters/options`, { headers })
      if (response && response.data.data) {
        setAvailableSizes(response.data.data.sizes || [])
        setAvailableColors(response.data.data.colors || [])
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value
    setFilters((prev) => ({
      ...prev,
      category: categoryId,
      subcategory: "",
    }))
    if (categoryId) {
      getSubcategories(categoryId)
    } else {
      setSubcategories([])
    }
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  useEffect(() => {
    getAllProducts()
  }, [page, limit])

  useEffect(() => {
    getCategories()
    getProductFilters()
  }, [])

  return (
    <>
      {loading ? <Loader /> : ""}
      <div>
        <div className="">
          <FontAwesomeIcon icon={faArrowLeft} className="backicon pointer mb-3" onClick={handleBack} />
          <div className="table-heading">
            <h1>All Products</h1>
            <p>View and manage all products efficiently. Use the filters below to find specific products.</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filter-section mb-4">
          <h5>Filter Products</h5>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select name="category" value={filters.category} onChange={handleCategoryChange}>
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.category_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Subcategory</Form.Label>
                <Form.Select
                  name="subcategory"
                  value={filters.subcategory}
                  onChange={handleFilterChange}
                  disabled={!filters.category}
                >
                  <option value="">All Subcategories</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory._id} value={subcategory._id}>
                      {subcategory.subcategory_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Size</Form.Label>
                <Form.Select name="size" value={filters.size} onChange={handleFilterChange}>
                  <option value="">All Sizes</option>
                  {availableSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Color</Form.Label>
                <Form.Select name="color" value={filters.color} onChange={handleFilterChange}>
                  <option value="">All Colors</option>
                  {availableColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Min Price</Form.Label>
                <Form.Control
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min Price"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Max Price</Form.Label>
                <Form.Control
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max Price"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Featured</Form.Label>
                <Form.Select name="featured" value={filters.featured} onChange={handleFilterChange}>
                  <option value="">All Products</option>
                  <option value="true">Featured Only</option>
                  <option value="false">Non-Featured</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Bestseller</Form.Label>
                <Form.Select name="bestseller" value={filters.bestseller} onChange={handleFilterChange}>
                  <option value="">All Products</option>
                  <option value="true">Bestseller Only</option>
                  <option value="false">Non-Bestseller</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by product name"
                  />
                  <Button variant="primary" className="ms-2" onClick={applyFilters}>
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
          <Button variant="secondary" onClick={resetFilters} className="me-2">
            Reset Filters
          </Button>
          <Button variant="primary" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>

        <div className="mt-3 mb-3 search-colum">
          <div>
            <Button className="filter-btn" onClick={() => navigate("/admin-product")}>
              <FontAwesomeIcon icon={faPlus} /> Add Product
            </Button>
          </div>
        </div>

        <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
          <AgGridReact
            rowData={allProducts}
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

      {/* Delete Confirmation Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this product?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success/Error Modal */}
      <Modal show={showSuccess} onHide={handleCloseSuccess}>
        <Modal.Header closeButton>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSuccess}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default AdminProducts
