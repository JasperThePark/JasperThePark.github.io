import React from 'react'
import "./aboutUs.css"
import about from "../images/restaurant.png"

const Header = () => {
    return (
      <header className='headr'>
          <section>
                  <div className='banner'>
                      <h2 className='s'>About us</h2>
                      <p className='a'>
                      Little Lemon is a charming, family-owned American restaurant that prides itself on a rich heritage of traditional recipes passed down through generations. At the heart of our culinary philosophy is a deep commitment to authenticity and meticulous attention to detail. While we honor these time-honored cooking methods, we also embrace innovation, offering a modern twist to our classic dishes to create a unique dining experience.
                      </p>
                  </div>
                  <div className="banner-im">
                      <img src={about} alt=''/>
                  </div>
          </section>
      </header>
    )
  }
  
  export default Header