import React from 'react';
import "./Img.css"
function Img() {
  return (
    <div className="flex justify-center items-center h-screen">
      <img 
        src="./404.jpg" 
        alt="Sample" 
        className="rounded-lg shadow-lg custom-img"
      />
    </div>
  );
}

export default Img;
