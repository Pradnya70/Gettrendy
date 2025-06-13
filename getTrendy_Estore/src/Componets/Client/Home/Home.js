// import React, { useEffect } from "react";
// import Carousel from "react-bootstrap/Carousel";
// import Hero from "../Hero/Hero";
// import "./Home.css";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import { Button } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import Aos from "aos";
// import "aos/dist/aos.css";

// const Home = () => {
//   const navigate = useNavigate();

//   const navigateToShop = () => {
//     navigate("/shop");
//     window.scroll(0, 0);
//   };

//   useEffect(() => {
//     Aos.init({
//       duration: 1000,
//       once: true,
//     });
//   }, []);
//   return (
//     <>
//       <Carousel
//         prevIcon={<FaChevronLeft />}
//         nextIcon={<FaChevronRight />}
//         className="custom-carousel"
//       >
//         <Carousel.Item>
//           <div className="carousel-content" >
//             {/* <div
//               className="left-side"
//               data-aos="fade-right"
//               data-aos-duration="2000"
//             >
//               <img src="/Images/todays.png" alt="label" />
//               <h3>Wear Your Story : Custom Tees for Every Mood</h3>
//               <p>
//                 Express yourself with our premium collection of custom T-shirts.
//                 Whether it’s bold, quirky, or minimalist, we’ve got a tee for
//                 every vibe!
//               </p>
//               <Button className="home-btn btn" onClick={() => navigateToShop()}>
//                 Shop Now
//               </Button>
//             </div> */}
//             <div
//               className="right-side"
//               data-aos="fade-left"
//               data-aos-duration="2000"
//             >
//               <img
//                 className="d-block w-100"
//                 src="/Images/banner-1.png"
//                 alt="First slide"
//               />
//             </div>
//           </div>
//         </Carousel.Item>
//         <Carousel.Item>
//           <div className="carousel-content">
//             {/* <div
//               className="left-side"
//               data-aos="fade-right"
//               data-aos-duration="2000"
//             >
//               <img src="/Images/todays.png" alt="label" />
//               <h3>Style Meets Comfort : T-Shirts That Speak</h3>
//               <p>
//                 Discover ultra-soft, durable T-shirts designed to make a
//                 statement. Perfect for casual wear, workouts, or just chilling
//                 in style.
//               </p>
//               <Button className="home-btn btn" onClick={() => navigateToShop()}>
//                 Shop Now
//               </Button>
//             </div> */}
//             <div
//               className="right-side"
//               data-aos="fade-left"
//               data-aos-duration="2000"
//             >
//               <img
//                 className="d-block w-100"
//                 src="/Images/banner-2.png" // Replace with your image source
//                 alt="Second slide"
//               />
//             </div>
//           </div>
//         </Carousel.Item>
//         <Carousel.Item>
//           <div className="carousel-content">
//             {/* <div
//               className="left-side"
//               data-aos="fade-right"
//               data-aos-duration="2000"
//             >
//               <img src="/Images/todays.png" alt="label" />
//               <h3>Style Meets Comfort : T-Shirts That Speak</h3>
//               <p>
//                 Discover ultra-soft, durable T-shirts designed to make a
//                 statement. Perfect for casual wear, workouts, or just chilling
//                 in style.
//               </p>
//               <Button className="home-btn btn" onClick={() => navigateToShop()}>
//                 Shop Now
//               </Button>
//             </div> */}
//             <div
//               className="right-side"
//               data-aos="fade-left"
//               data-aos-duration="2000"
//             >
//               <img
//                 className="d-block w-100"
//                 src="/Images/banner-3.png" // Replace with your image source
//                 alt="Second slide"
//               />
//             </div>
//           </div>
//         </Carousel.Item>
       
//       </Carousel>
//       <Hero />
//     </>
//   );
// };

// export default Home;



import React, { useEffect } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Hero from "../Hero/Hero";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import Aos from "aos";
import "aos/dist/aos.css";

const Home = () => {
  const navigate = useNavigate();

  const navigateToShop = () => {
    navigate("/shop");
    window.scroll(0, 0);
  };

  useEffect(() => {
    Aos.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const items = [
    {
      image: "/Images/01.webp",
     
    },
    {
      image: "/Images/02.webp",
     
    },
    {
      image: "/Images/03.webp",
     
    }
  ];

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 1
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 1
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1
    }
  };

  return (
    <>
      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        arrows
        className="custom-carousel"
        containerClass="carousel-container"
        itemClass="carousel-item-padding-20-px"
      >
        {items.map((item, index) => (
          <div className="carousel-card" key={index} data-aos="fade-up">
  <img src={item.image} alt={`slide-${index}`} />
</div>
        ))}
      </Carousel>
      <Hero />
    </>
  );
};

export default Home;