"use client"

import { useEffect, useState } from "react"
import { faArrowLeft, faPenToSquare, faPlus, faTrash, faFilter } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
import { Pagination } from "@mui/material"
import Loader from "../../Client/Loader/Loader"
import { Button, Modal, Form, Row, Col, Card, Badge, Tabs, Tab } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import ApiService from "../../api/services/api-service"
import API_CONFIG from "../../api/services/api-config"

const Dashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("categories")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showMessage, setShowMessage] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState(null)
  const [deleteItemType, setDeleteItemType] = useState(null)
  const BASEURL = API_CONFIG.baseURL

  // Common function to handle back navigation
  const handleBack = () => {
    window.history.back()
  }

  // Common function to close message modal
  const handleCloseMessage = () => setShowMessage(false)

  // Common function to show message
  const showMessageAlert = (msg) => {
    setMessage(msg)
    setShowMessage(true)
  }

  // Common function to handle delete confirmation
  const handleOpenDelete = (id, type) => {
    setDeleteItemId(id)
    setDeleteItemType(type)
    setShowDeleteModal(true)
  }

  // Common function to close delete modal
  const handleCloseDelete = () => setShowDeleteModal(false)

  // Common function to handle delete
  const handleDelete = async () => {
    try {
      setLoading(true)
      handleCloseDelete()

      let response
      switch (deleteItemType) {
        case "category":
          response = await ApiService.deleteCategory(deleteItemId)
          break
        case "subcategory":
          response = await ApiService.deleteSubcategory(deleteItemId)
          break
        case "product":
          response = await ApiService.deleteProduct(deleteItemId)
          break
        default:
          throw new Error("Invalid delete type")
      }

      if (response) {
        showMessageAlert(`${deleteItemType.charAt(0).toUpperCase() + deleteItemType.slice(1)} deleted successfully`)

        // Refresh the appropriate data
        if (deleteItemType === "category") {
          getAllCategories()
        } else if (deleteItemType === "subcategory") {
          getAllSubCategories()
        } else if (deleteItemType === "product") {
          fetchProducts()
        }
      }

      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error("Delete error:", error)
      showMessageAlert(`Error deleting ${deleteItemType}: ${error.response?.data?.message || error.message}`)
    }
  }

  // ==================== CATEGORIES ====================
  const [categories, setCategories] = useState([])
  const [categoryPage, setCategoryPage] = useState(1)
  const [categoryLimit, setCategoryLimit] = useState(10)
  const [categoryTotalPages, setCategoryTotalPages] = useState(1)

  const categoryColumnDefs = [
    { headerName: "Sr No", field: "sr", sortable: true, filter: true, width: 80 },
    { headerName: "Category Name", field: "category_name", sortable: true, filter: true },
    {
      headerName: "Category Image",
      field: "category_image",
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <img
          src={params.data.category_image ? BASEURL + params.data.category_image : "/placeholder.svg"}
          alt="category"
          style={{ height: "50px", width: "50px", objectFit: "cover" }}
        />
      ),
    },
    { headerName: "Description", field: "category_description", sortable: true, filter: true },
    {
      headerName: "Action",
      field: "_id",
      width: 120,
      cellRenderer: (params) => (
        <div className="d-flex gap-2">
          <FontAwesomeIcon
            icon={faPenToSquare}
            title="Edit"
            className="action-icon"
            onClick={() => navigate("/admin-main-category", { state: { mainCategoryId: params.value } })}
          />
          <FontAwesomeIcon
            icon={faTrash}
            title="Delete"
            className="action-icon"
            onClick={() => handleOpenDelete(params.value, "category")}
          />
        </div>
      ),
    },
  ]

  const getAllCategories = async () => {
    try {
      setLoading(true)

      const response = await ApiService.getCategories(categoryPage, categoryLimit)

      if (response && response.data) {
        const dataWithSr = response.data.rows.map((item, index) => ({
          ...item,
          sr: (categoryPage - 1) * categoryLimit + index + 1,
        }))

        setCategories(dataWithSr)
        setCategoryTotalPages(response.data.pages_count)
      }

      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error("Error fetching categories:", error)
    }
  }

  const handleCategoryPageChange = (event, value) => {
    setCategoryPage(value)
  }

  // ==================== SUBCATEGORIES ====================
  const [subcategories, setSubcategories] = useState([])
  const [subcategoryPage, setSubcategoryPage] = useState(1)
  const [subcategoryLimit, setSubcategoryLimit] = useState(10)
  const [subcategoryTotalPages, setSubcategoryTotalPages] = useState(1)

  const subcategoryColumnDefs = [
    { headerName: "Sr No", field: "sr", sortable: true, filter: true, width: 80 },
    { headerName: "Subcategory Name", field: "subcategory_name", sortable: true, filter: true },
    {
      headerName: "Parent Category",
      field: "parent_category",
      sortable: true,
      filter: true,
      valueGetter: (params) => {
        return params.data.parent_category?.category_name || "N/A"
      },
    },
    {
      headerName: "Image",
      field: "subcategory_image",
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <img
          src={params.data.subcategory_image ? BASEURL + params.data.subcategory_image : "/placeholder.svg"}
          alt="subcategory"
          style={{ height: "50px", width: "50px", objectFit: "cover" }}
        />
      ),
    },
    { headerName: "Description", field: "subcategory_description", sortable: true, filter: true },
    {
      headerName: "Action",
      field: "_id",
      width: 120,
      cellRenderer: (params) => (
        <div className="d-flex gap-2">
          <FontAwesomeIcon
            icon={faPenToSquare}
            title="Edit"
            className="action-icon"
            onClick={() => navigate("/admin-category", { state: { categoryID: params.value } })}
          />
          <FontAwesomeIcon
            icon={faTrash}
            title="Delete"
            className="action-icon"
            onClick={() => handleOpenDelete(params.value, "subcategory")}
          />
        </div>
      ),
    },
  ]

  const getAllSubCategories = async () => {
    try {
      setLoading(true)

      const response = await ApiService.getSubcategories(subcategoryPage, subcategoryLimit)

      if (response && response.data) {
        const dataWithSr = response.data.rows.map((item, index) => ({
          ...item,
          sr: (subcategoryPage - 1) * subcategoryLimit + index + 1,
        }))

        setSubcategories(dataWithSr)
        setSubcategoryTotalPages(response.data.pages_count)
      }

      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error("Error fetching subcategories:", error)
    }
  }

  const handleSubcategoryPageChange = (event, value) => {
    setSubcategoryPage(value)
  }

  // ==================== PRODUCTS ====================
  const [products, setProducts] = useState([])
  const [productPage, setProductPage] = useState(1)
  const [productLimit, setProductLimit] = useState(10)
  const [productTotalPages, setProductTotalPages] = useState(1)
  const [showProductFilters, setShowProductFilters] = useState(false)
  const [productFilters, setProductFilters] = useState({
    size: "",
    color: "",
    category: "",
    search: "",
    minPrice: "",
    maxPrice: "",
  })
  const [availableSizes, setAvailableSizes] = useState([])
  const [availableColors, setAvailableColors] = useState([])

  const productColumnDefs = [
    { headerName: "Sr No", field: "sr", sortable: true, filter: true, width: 80 },
    {
      headerName: "Image",
      field: "images",
      sortable: false,
      filter: false,
      width: 100,
      cellRenderer: (params) => {
        const images = params.value
        return images && images.length > 0 ? (
          <img
            src={BASEURL + images[0] || "/placeholder.svg"}
            alt="product"
            style={{ height: "50px", width: "50px", objectFit: "cover" }}
          />
        ) : (
          <div>No Image</div>
        )
      },
    },
    { headerName: "Product Name", field: "product_name", sortable: true, filter: true },
    {
      headerName: "Price",
      field: "price",
      sortable: true,
      filter: true,
      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
    },
    {
      headerName: "Category",
      field: "category",
      sortable: true,
      filter: true,
      valueGetter: (params) => {
        return params.data.category?.category_name || "N/A"
      },
    },
    {
      headerName: "Stock",
      field: "stock",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Sizes",
      field: "sizes",
      sortable: false,
      filter: false,
      cellRenderer: (params) => (params.value && params.value.length > 0 ? params.value.join(", ") : "N/A"),
    },
    {
      headerName: "Colors",
      field: "colors",
      sortable: false,
      filter: false,
      cellRenderer: (params) => (params.value && params.value.length > 0 ? params.value.join(", ") : "N/A"),
    },
    {
      headerName: "Action",
      field: "_id",
      width: 120,
      cellRenderer: (params) => (
        <div className="d-flex gap-2">
          <FontAwesomeIcon
            icon={faPenToSquare}
            title="Edit"
            className="action-icon"
            onClick={() => navigate("/admin-product", { state: { productId: params.value } })}
          />
          <FontAwesomeIcon
            icon={faTrash}
            title="Delete"
            className="action-icon"
            onClick={() => handleOpenDelete(params.value, "product")}
          />
        </div>
      ),
    },
  ]

  const fetchProducts = async () => {
    try {
      setLoading(true)

      const response = await ApiService.getProducts(productPage, productLimit, productFilters)

      if (response && response.data) {
        const dataWithSr = response.data.rows.map((item, index) => ({
          ...item,
          sr: (productPage - 1) * productLimit + index + 1,
        }))

        setProducts(dataWithSr)
        setProductTotalPages(response.data.pages_count)
      }

      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error("Error fetching products:", error)
    }
  }

  const getProductFilterOptions = async () => {
    try {
      const response = await ApiService.getProductFilters()

      if (response?.data?.data) {
        if (response.data.data.sizes?.length > 0) {
          setAvailableSizes(response.data.data.sizes)
        }
        if (response.data.data.colors?.length > 0) {
          setAvailableColors(response.data.data.colors)
        }
      }
    } catch (error) {
      console.error("Error fetching filter options:", error)
    }
  }

  const handleProductFilterChange = (e) => {
    const { name, value } = e.target
    setProductFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyProductFilters = () => {
    setProductPage(1) // Reset to first page when applying filters
    fetchProducts()
  }

  const resetProductFilters = () => {
    setProductFilters({
      size: "",
      color: "",
      category: "",
      search: "",
      minPrice: "",
      maxPrice: "",
    })
    setProductPage(1) // Reset to first page
    fetchProducts()
  }

  const toggleProductFilters = () => {
    setShowProductFilters(!showProductFilters)
  }

  const handleProductPageChange = (event, value) => {
    setProductPage(value)
  }

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "categories") {
      getAllCategories()
    } else if (activeTab === "subcategories") {
      getAllSubCategories()
    } else if (activeTab === "products") {
      fetchProducts()
      getProductFilterOptions()
    }
  }, [activeTab, categoryPage, subcategoryPage, productPage])

  // Default column definition for AG Grid
  const defaultColDef = {
    flex: 1,
    minWidth: 150,
    resizable: true,
  }

  return (
    <div className="dashboard-container">
      {loading && <Loader />}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="outline-secondary" onClick={handleBack} className="me-2">
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </Button>
          <h2 className="d-inline-block ms-3">Admin Dashboard</h2>
        </div>
      </div>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="categories" title="Categories">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Categories Management</h3>
            <Button variant="primary" onClick={() => navigate("/admin-main-category")}>
              <FontAwesomeIcon icon={faPlus} /> Add Category
            </Button>
          </div>

          <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
            <AgGridReact
              rowData={categories}
              columnDefs={categoryColumnDefs}
              defaultColDef={defaultColDef}
              pagination={false}
              domLayout="autoHeight"
            />
          </div>

          <div className="d-flex justify-content-center mt-3">
            <Pagination
              count={categoryTotalPages}
              page={categoryPage}
              onChange={handleCategoryPageChange}
              color="primary"
            />
          </div>
        </Tab>

        <Tab eventKey="subcategories" title="Subcategories">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Subcategories Management</h3>
            <Button variant="primary" onClick={() => navigate("/admin-category")}>
              <FontAwesomeIcon icon={faPlus} /> Add Subcategory
            </Button>
          </div>

          <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
            <AgGridReact
              rowData={subcategories}
              columnDefs={subcategoryColumnDefs}
              defaultColDef={defaultColDef}
              pagination={false}
              domLayout="autoHeight"
            />
          </div>

          <div className="d-flex justify-content-center mt-3">
            <Pagination
              count={subcategoryTotalPages}
              page={subcategoryPage}
              onChange={handleSubcategoryPageChange}
              color="primary"
            />
          </div>
        </Tab>

        <Tab eventKey="products" title="Products">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Products Management</h3>
            <div>
              <Button variant="outline-secondary" onClick={toggleProductFilters} className="me-2">
                <FontAwesomeIcon icon={faFilter} /> {showProductFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button variant="primary" onClick={() => navigate("/admin-product")}>
                <FontAwesomeIcon icon={faPlus} /> Add Product
              </Button>
            </div>
          </div>

          {showProductFilters && (
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Size</Form.Label>
                      <Form.Select name="size" value={productFilters.size} onChange={handleProductFilterChange}>
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
                      <Form.Select name="color" value={productFilters.color} onChange={handleProductFilterChange}>
                        <option value="">All Colors</option>
                        {availableColors.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select name="category" value={productFilters.category} onChange={handleProductFilterChange}>
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
                      <Form.Label>Search</Form.Label>
                      <Form.Control
                        type="text"
                        name="search"
                        value={productFilters.search}
                        onChange={handleProductFilterChange}
                        placeholder="Search products..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Min Price</Form.Label>
                      <Form.Control
                        type="number"
                        name="minPrice"
                        value={productFilters.minPrice}
                        onChange={handleProductFilterChange}
                        placeholder="Min price"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Max Price</Form.Label>
                      <Form.Control
                        type="number"
                        name="maxPrice"
                        value={productFilters.maxPrice}
                        onChange={handleProductFilterChange}
                        placeholder="Max price"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button variant="secondary" className="me-2" onClick={resetProductFilters}>
                    Reset
                  </Button>
                  <Button variant="primary" onClick={applyProductFilters}>
                    Apply Filters
                  </Button>
                </div>

                {/* Active Filters Display */}
                <div className="mt-3">
                  <h6>Active Filters:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {productFilters.size && (
                      <Badge bg="info" className="p-2">
                        Size: {productFilters.size}
                      </Badge>
                    )}
                    {productFilters.color && (
                      <Badge bg="info" className="p-2">
                        Color: {productFilters.color}
                      </Badge>
                    )}
                    {productFilters.category && (
                      <Badge bg="info" className="p-2">
                        Category:{" "}
                        {categories.find((c) => c._id === productFilters.category)?.category_name ||
                          productFilters.category}
                      </Badge>
                    )}
                    {productFilters.search && (
                      <Badge bg="info" className="p-2">
                        Search: {productFilters.search}
                      </Badge>
                    )}
                    {productFilters.minPrice && (
                      <Badge bg="info" className="p-2">
                        Min Price: ${productFilters.minPrice}
                      </Badge>
                    )}
                    {productFilters.maxPrice && (
                      <Badge bg="info" className="p-2">
                        Max Price: ${productFilters.maxPrice}
                      </Badge>
                    )}
                    {!productFilters.size &&
                      !productFilters.color &&
                      !productFilters.category &&
                      !productFilters.search &&
                      !productFilters.minPrice &&
                      !productFilters.maxPrice && <span className="text-muted">No active filters</span>}
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
            <AgGridReact
              rowData={products}
              columnDefs={productColumnDefs}
              defaultColDef={defaultColDef}
              pagination={false}
              domLayout="autoHeight"
            />
          </div>

          <div className="d-flex justify-content-center mt-3">
            <Pagination
              count={productTotalPages}
              page={productPage}
              onChange={handleProductPageChange}
              color="primary"
            />
          </div>
        </Tab>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this {deleteItemType}? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Message Modal */}
      <Modal show={showMessage} onHide={handleCloseMessage}>
        <Modal.Header closeButton>
          <Modal.Title>{message.includes("Error") ? "Error" : "Success"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMessage}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Dashboard
