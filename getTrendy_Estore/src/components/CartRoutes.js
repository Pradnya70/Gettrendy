import { Routes, Route } from "react-router-dom";
import { CartProvider } from "../CartContext/CartContext";

const CartRoutes = ({ children }) => {
  return (
    <CartProvider>
      <Routes>
        {children}
      </Routes>
    </CartProvider>
  );
};

export default CartRoutes;
