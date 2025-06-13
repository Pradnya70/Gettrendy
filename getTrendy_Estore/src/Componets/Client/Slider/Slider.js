import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "./Slider.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, A11y, Autoplay } from "swiper/modules";
import axios from "axios";
import { BASEURL } from "../Comman/CommanConstans";
import Loader from "../Loader/Loader";
import { useNavigate } from "react-router-dom";

const Slider = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allCategorise, setAllCategorise] = useState([]);

  const getAllCategories = async () => {
    try {
      const response = await axios.get(
        `${BASEURL}/api/products?page=1&limit=50`
      );
      if (response) {
        console.log(response);
        
        // setAllCategorise(response.data.categories);
        console.log('Slider component rendered');
console.log('Loading state:', loading);
console.log('All categories:', allCategorise);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToShop = (Id) => {
    window.scroll(0, 0);
    navigate("/shop", { state: { category: Id } });
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  return (
    <>
      {loading ? <Loader /> : null}
      <div className="slider-container">
        <div className="container leftSide">
          <div className="row">
            <Swiper
              dir="rtl"
              modules={[Navigation, A11y, Autoplay]}
              spaceBetween={5}
              slidesPerView={3}
              loop={true}
              loopedSlides={allCategorise.length}
              // autoplay={{
              //   delay: 3000,
              //   disableOnInteraction: false,
              // }}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                1200: {
                  slidesPerView: 3,
                },
                992: {
                  slidesPerView: 3,
                },
                768: {
                  slidesPerView: 2,
                },
                0: {
                  slidesPerView: 1,
                  centeredSlides: true,
                },
              }}
              className="mySwiper pointer"
            >
              {allCategorise.length > 0 ? (
                allCategorise.map((category, index) => (
                  <SwiperSlide
                    key={category.id}
                    onClick={() => navigateToShop(category.id)}
                  >
                    <div className="category-card mb-3">
                      <img
                        src={BASEURL + category.category_image}
                        alt={category.category_name}
                        className="category-image"
                      />
                      <div className="category-label">
                        <h5>{category.name}</h5>
                      </div>
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide>No categories available.</SwiperSlide>
              )}
            </Swiper>
          </div>
        </div>
      </div>
    </>
  );
};

export default Slider;
