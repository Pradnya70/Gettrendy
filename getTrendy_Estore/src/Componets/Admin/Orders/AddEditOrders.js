import React from "react";

const AddEditOrders = () => {
  const obj = {
    id: "ae364973-e40f-4d48-bb2d-1395cd167842",
    user: "c462e0e1-0f4b-4214-867a-9ff351d4a055",
    amount: "170.00",
    name: null,
    city: null,
    mobile_number: null,
    notes: null,
    email: null,
    is_paid: false,
    order_id: "8611",
    transaction_id: null,
    payment_status: null,
    order_status: "Pending",
    delivery_boy: "ecb87b23-eeb4-4ca0-b9d6-b2c4809392da",
    store_id: "ec43086d-ce44-4565-9be5-90d77d35168f",
    payment_type: "UPI",
    delivery_address: "katraj pune 46",
    delivery_cost: "50.00",
    delivery_time: null,
    pincode: "411046",
    ordered_items: [
      {
        product: "e10ce9cb-2d79-4b2b-ac6c-0ec8bcb32c4b",
        quantity: 1,
        product_name: "Country Egg (6PC)",
        product_price: 120,
        product_image: "/media/product/Country_Egg_6PC.jpg",
      },
    ],
    username: "Store Admin",
    store_name: "Get Trendy Store 1",
  };
  return (
    <>
      <div>AddEditOrders</div>
    </>
  );
};

export default AddEditOrders;
