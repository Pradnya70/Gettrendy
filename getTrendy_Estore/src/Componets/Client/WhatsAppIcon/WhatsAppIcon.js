import React from "react";
import "./WhatsAppIcon.css"; // Create a CSS file for styling

const WhatsAppIcon = () => {
  const whatsappNumber = "+918551000442"; // Replace with your WhatsApp number

  const handleClick = () => {
    window.open(`https://wa.me/${8551000442}`, "_blank");
  };

  return (
    <div className="whatsapp-icon" onClick={handleClick}>
      <img src="/Images/whatsappimg.png" alt="whatsapp" />
    </div>
  );
};

export default WhatsAppIcon;
