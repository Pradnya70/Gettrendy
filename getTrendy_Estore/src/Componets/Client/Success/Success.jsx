import { Link } from "react-router-dom"
import "./Success.css"
import Footer from "../Footer/Footer"

const Success = () => {
  return (
    <>
      <div className="container section" style={{ paddingTop: "150px" }}>
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card card-align bg-white p-5 rounded shadow-lg text-center">
              <div className="success-icon mb-4">
                <i className="fas fa-check-circle fa-5x text-success"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your order is placed successfully</h2>
              <p className="mb-4">
                Thank you for your purchase! Your order has been confirmed and will be processed shortly.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/shop">
                  <button className="btn btn-primary px-4 py-2">Continue Shopping</button>
                </Link>
                <Link to="/myOrders">
                  <button className="btn btn-success px-4 py-2">Check Your Order</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Success
