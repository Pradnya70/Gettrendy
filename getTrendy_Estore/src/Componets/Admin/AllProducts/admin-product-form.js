"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Form, Button, Image } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { createProduct, updateProduct, getProductById } from "../../actions/productActions"
import { listCategories } from "../../actions/categoryActions"
import { listSubcategories } from "../../actions/subcategoryActions"
import Loader from "../../components/Loader"
import Message from "../../components/Message"

function AddProduct() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id: productId } = useParams()

  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    price: "",
    discount_price: "",
    category: "",
    subcategory: "",
    stock: "0",
    featured: false,
    bestseller: false, // Changed to lowercase for consistency
    sizes: [],
    colors: [],
    images: [],
  })

  const [imagePreviews, setImagePreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const productDetails = useSelector((state) => state.productDetails)
  const { loading, error, product } = productDetails

  const categoryList = useSelector((state) => state.categoryList)
  const { loading: loadingCategories, error: errorCategories, categories } = categoryList

  const subcategoryList = useSelector((state) => state.subcategoryList)
  const { loading: loadingSubcategories, error: errorSubcategories, subcategories } = subcategoryList

  const productCreate = useSelector((state) => state.productCreate)
  const { loading: loadingCreate, error: errorCreate, success: successCreate } = productCreate

  const productUpdate = useSelector((state) => state.productUpdate)
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = productUpdate

  useEffect(() => {
    dispatch(listCategories())
    dispatch(listSubcategories())

    if (productId) {
      dispatch(getProductById(productId))
    }
  }, [dispatch, productId])

  useEffect(() => {
    if (product) {
      setFormData({
        product_name: product.product_name || "",
        product_description: product.product_description || "",
        price: product.price || "",
        discount_price: product.discount_price || "",
        category: product.category?._id || "",
        subcategory: product.subcategory?._id || "",
        stock: product.stock?.toString() || "0",
        featured: Boolean(product.featured), // Ensure boolean
        bestseller: Boolean(product.Bestseller), // Map from DB field to form field
        sizes: product.sizes || [],
        colors: product.colors || [],
        images: [],
      })
      setImagePreviews(product.images || [])
    }

    if (successCreate || successUpdate) {
      if (formData.bestseller) {
        navigate("/admin-allproducts?bestseller=true")
      } else if (formData.featured) {
        navigate("/admin-allproducts?featured=true")
      } else {
        navigate("/admin-allproducts")
      }
    }
  }, [product, productId, successCreate, successUpdate, navigate, formData.bestseller, formData.featured])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    console.log(`🔍 Input change: Name=${name}, Value=${value}, Checked=${checked}, Type=${type}`)

    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      }
      console.log(`🔍 Updated formData:`, newData)
      return newData
    })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newImages = []
    const newPreviews = []

    files.forEach((file) => {
      newImages.push(file)
      newPreviews.push(URL.createObjectURL(file))
    })

    setFormData({
      ...formData,
      images: [...formData.images, ...newImages],
    })
    setImagePreviews([...imagePreviews, ...newPreviews])
  }

  const handleRemoveImage = (index) => {
    const newImages = [...formData.images]
    newImages.splice(index, 1)

    const newPreviews = [...imagePreviews]
    newPreviews.splice(index, 1)

    setFormData({
      ...formData,
      images: newImages,
    })
    setImagePreviews(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      console.log(`🚀 FORM SUBMIT DEBUG - Current formData:`, formData)

      const formDataToSend = new FormData()
      formDataToSend.append("product_name", formData.product_name)
      formDataToSend.append("product_description", formData.product_description)
      formDataToSend.append("price", formData.price)
      formDataToSend.append("discount_price", formData.discount_price)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("subcategory", formData.subcategory)
      formDataToSend.append("stock", formData.stock)

      // Convert boolean to string explicitly and use consistent field names
      const featuredValue = formData.featured === true ? "true" : "false"
      const bestsellerValue = formData.bestseller === true ? "true" : "false"

      console.log(`🔍 Boolean conversion:`)
      console.log(`- formData.featured (${typeof formData.featured}): ${formData.featured} -> ${featuredValue}`)
      console.log(`- formData.bestseller (${typeof formData.bestseller}): ${formData.bestseller} -> ${bestsellerValue}`)

      formDataToSend.append("featured", featuredValue)
      formDataToSend.append("bestseller", bestsellerValue) // Use lowercase consistently

      // Handle sizes and colors
      if (formData.sizes && formData.sizes.length > 0) {
        formData.sizes.forEach((size) => {
          formDataToSend.append("sizes", size)
        })
      }

      if (formData.colors && formData.colors.length > 0) {
        formData.colors.forEach((color) => {
          formDataToSend.append("colors", color)
        })
      }

      formData.images.forEach((image) => {
        formDataToSend.append("images", image)
      })

      // Debug: Log all FormData entries
      console.log(`🔍 COMPLETE FormData being sent:`)
      for (const pair of formDataToSend.entries()) {
        console.log(`- ${pair[0]}: ${pair[1]} (type: ${typeof pair[1]})`)
      }

      if (productId) {
        dispatch(updateProduct(productId, formDataToSend))
      } else {
        dispatch(createProduct(formDataToSend))
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setUploadError("Error submitting form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container>
      <Row>
        <Col md={8}>
          <h1>{productId ? "Edit Product" : "Add Product"}</h1>

          {/* Debug Panel */}
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              marginBottom: "20px",
              border: "1px solid #dee2e6",
              borderRadius: "5px",
            }}
          >
            <h5>🔍 Debug Panel</h5>
            <div>
              <strong>Featured:</strong> {String(formData.featured)} (type: {typeof formData.featured})
            </div>
            <div>
              <strong>Bestseller:</strong> {String(formData.bestseller)} (type: {typeof formData.bestseller})
            </div>
          </div>

          {loadingCreate || loadingUpdate ? (
            <Loader />
          ) : errorCreate || errorUpdate ? (
            <Message variant="danger">{errorCreate || errorUpdate}</Message>
          ) : (
            <></>
          )}
          {uploadError && <Message variant="danger">{uploadError}</Message>}
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <Form onSubmit={handleSubmit}>
              <CardContainer>
                <CardHeader>Basic Information</CardHeader>
                <CardBody>
                  <Form.Group className="mb-3" controlId="product_name">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter product name"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="product_description">
                    <Form.Label>Product Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter product description"
                      name="product_description"
                      value={formData.product_description}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </CardBody>
              </CardContainer>

              <CardContainer>
                <CardHeader>Pricing & Inventory</CardHeader>
                <CardBody>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="price">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter price"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="discount_price">
                        <Form.Label>Discount Price</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter discount price"
                          name="discount_price"
                          value={formData.discount_price}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="stock">
                        <Form.Label>Stock</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter stock"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <div style={{ padding: "10px", backgroundColor: "#e9ecef", marginBottom: "10px" }}>
                          <strong>Checkbox Debug:</strong>
                          <div>Featured: {String(formData.featured)}</div>
                          <div>Bestseller: {String(formData.bestseller)}</div>
                        </div>

                        <Form.Check
                          type="checkbox"
                          label="Featured Product"
                          name="featured"
                          id="featuredProductCheckbox"
                          checked={formData.featured}
                          onChange={handleInputChange}
                        />
                        <Form.Check
                          type="checkbox"
                          label="Bestseller Product"
                          name="bestseller"
                          id="bestsellerProductCheckbox"
                          checked={formData.bestseller}
                          onChange={handleInputChange}
                          className="mt-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </CardBody>
              </CardContainer>

              <CardContainer>
                <CardHeader>Category & Subcategory</CardHeader>
                <CardBody>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="category">
                        <Form.Label>Category</Form.Label>
                        {loadingCategories ? (
                          <Loader />
                        ) : errorCategories ? (
                          <Message variant="danger">{errorCategories}</Message>
                        ) : (
                          <Form.Control
                            as="select"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Category</option>
                            {categories?.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.category_name}
                              </option>
                            ))}
                          </Form.Control>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="subcategory">
                        <Form.Label>Subcategory (Optional)</Form.Label>
                        {loadingSubcategories ? (
                          <Loader />
                        ) : errorSubcategories ? (
                          <Message variant="danger">{errorSubcategories}</Message>
                        ) : (
                          <Form.Control
                            as="select"
                            name="subcategory"
                            value={formData.subcategory}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Subcategory</option>
                            {subcategories?.map((subcategory) => (
                              <option key={subcategory._id} value={subcategory._id}>
                                {subcategory.subcategory_name}
                              </option>
                            ))}
                          </Form.Control>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </CardBody>
              </CardContainer>

              <CardContainer>
                <CardHeader>Product Attributes</CardHeader>
                <CardBody>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="sizes">
                        <Form.Label>Sizes (comma separated)</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., S, M, L, XL"
                          name="sizes"
                          value={Array.isArray(formData.sizes) ? formData.sizes.join(", ") : formData.sizes}
                          onChange={(e) => {
                            const sizesArray = e.target.value
                              .split(",")
                              .map((size) => size.trim())
                              .filter((size) => size)
                            setFormData({
                              ...formData,
                              sizes: sizesArray,
                            })
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="colors">
                        <Form.Label>Colors (comma separated)</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., Red, Blue, Green"
                          name="colors"
                          value={Array.isArray(formData.colors) ? formData.colors.join(", ") : formData.colors}
                          onChange={(e) => {
                            const colorsArray = e.target.value
                              .split(",")
                              .map((color) => color.trim())
                              .filter((color) => color !== "")
                            setFormData({
                              ...formData,
                              colors: colorsArray,
                            })
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </CardBody>
              </CardContainer>

              <CardContainer>
                <CardHeader>Images (Max 3)</CardHeader>
                <CardBody>
                  <Form.Group className="mb-3" controlId="images">
                    <Form.Label>Upload Images</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={imagePreviews.length >= 3}
                    />
                    {imagePreviews.length >= 3 && (
                      <Form.Text className="text-muted">
                        Maximum 3 images allowed. Remove an image to add more.
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Row>
                    {imagePreviews.map((preview, index) => (
                      <Col key={index} md={4} className="mb-3">
                        <div className="position-relative">
                          <Image
                            src={preview || "/placeholder.svg"}
                            fluid
                            rounded
                            style={{ height: "150px", objectFit: "cover", width: "100%" }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveImage(index)}
                            className="position-absolute top-0 end-0 m-1"
                          >
                            ×
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </CardContainer>

              <div className="d-flex gap-2 mb-4">
                <Button variant="primary" type="submit" disabled={isSubmitting || loadingCreate || loadingUpdate}>
                  {isSubmitting ? "Processing..." : productId ? "Update Product" : "Create Product"}
                </Button>
                <Button variant="secondary" type="button" onClick={() => navigate("/admin-allproducts")}>
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  )
}

const CardContainer = ({ children }) => (
  <div
    style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      marginBottom: "20px",
    }}
  >
    {children}
  </div>
)

const CardHeader = ({ children }) => (
  <div
    style={{
      background: "#f0f0f0",
      padding: "10px",
      borderBottom: "1px solid #ddd",
      fontWeight: "bold",
      borderTopLeftRadius: "8px",
      borderTopRightRadius: "8px",
    }}
  >
    {children}
  </div>
)

const CardBody = ({ children }) => <div style={{ padding: "10px" }}>{children}</div>

export default AddProduct
