import React from 'react';
import "./AboutUs.css";
import { LuChefHat } from "react-icons/lu";
import { TbBowlSpoon } from "react-icons/tb";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { FaRegSmileBeam } from "react-icons/fa";





const AboutUs = () => {
  return (
    <>

      <div>
        <div className='about-us-hero-section mb-96'>
          <div className='hero-text-div rounded-3 mx-auto p-5'>
            <h1 className='text-center mb-4'>About Us</h1>
            <p className='text-center'>KGN Xprs is a creation of people’s love and our sincere commitment towards offering quality food at affordable price. It all started with a simple thought to reach every heart of Pune & PCMC.</p>
          </div>
        </div>
        <div className='our-mission-section row mx-auto column-gap-1 '>
          <div class="col-12 col-xl-5 ml-lg-0 mr-lg-auto ">
            <h2 className='mb-4 text-center text-xl-start'>Our Mission</h2>
            <p>An overwhelming response received from people has encouraged KGN Xprs to go beyond imagination. Initially the biggest challenge was to meet people’s expectations. The brand received tremendous response but had limited presence that has inspired us to start a franchisee model. Same taste across franchisees and unmatched services is a unique element of KGN Xprs.</p>

            <p>Today KGN Xprs is a trusted and familiar brand in Pune, PCMC and Lonavala. We take pride in saying that our exceptional work is that we are engaged in creating entrepreneurs.</p>
          </div>

          <div class="col-12 col-xl-6 mx-auto ml-xl-auto mr-xl-0">
            <img src="images/kgn-food.jpg" alt="" className='rounded-3 img-fluid' />

          </div>
        </div>
        <div className='teams-work-section mx-auto mb-5 p-5'>
          <h2 className='text-center mb-5'>Our Features</h2>
          <div className='row column-gap-3 row-gap-3 feature-row justify-content-center'>
            <div className='col d-flex flex-column align-items-center p-5 feature-box col-12 col-md-5 col-xl'>

              <LuChefHat style={{ fontSize: '50px' }} className='mb-3 feature-icon' />
              <h5 className='text-center'>Delicious and High-Quality Food</h5>

            </div>
            <div className='col d-flex flex-column align-items-center p-5 feature-box col-12 col-md-5 col-xl'>

              <TbBowlSpoon style={{ fontSize: '50px' }} className='mb-3' />
              <h5 className='text-center' >Outstanding Customer Service</h5>


            </div>
            <div className='col d-flex flex-column align-items-center p-5 feature-box col-12 col-md-5 col-xl'>
              <RiMoneyRupeeCircleLine style={{ fontSize: '50px' }} className='mb-3' />

              <h5 className='text-center'>Value for Money</h5>

            </div>
            <div className='col d-flex flex-column align-items-center p-5 feature-box col-12 col-md-5 col-xl'>
              <FaRegSmileBeam style={{ fontSize: '50px' }} className='mb-3' />

              <h5 className='text-center'>Positive Reviews and Reputation</h5>

            </div>

          </div>

        </div>
      </div>
    </>
  )
}

export default AboutUs 