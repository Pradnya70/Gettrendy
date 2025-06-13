import React from "react";

const RazorpayButton = () => {
  const handlePayment = () => {
    const options = {
      key: "rzp_live_a1B4ev9JROunoM", // Replace with your Razorpay Key ID
      amount: 50000, // Amount in paise (e.g., 50000 paise = ₹500)
      currency: "INR",
      name: "GetTrendy",
      description: "Test Transaction",
      handler: function (response) {
        alert("Payment Successful!");
        console.log("Payment ID:", response.razorpay_payment_id);
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999",
      },
      notes: {
        address: "Customer Address",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button onClick={handlePayment}>
      Pay ₹500
    </button>
  );
};

export default RazorpayButton;
