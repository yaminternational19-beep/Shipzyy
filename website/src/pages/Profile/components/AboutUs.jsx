import React from "react";

function AboutUs() {
  return (
    <div className="static-page">
      <h2 className="section-title">About Us</h2>
      <p className="section-subtitle">Get to know the team and the mission behind Shipzyy.</p>
      
      <div className="static-content">
        <h4>Our Mission</h4>
        <p>
          At Shipzyy, we believe that getting your daily essentials shouldn't be a chore. 
          Our mission is to revolutionize the way you shop by bringing premium quality groceries, 
          fresh produce, and daily necessities right to your doorstep in minutes. We combine 
          cutting-edge technology with a robust delivery network to make shopping effortless.
        </p>
        
        <h4>Why Choose Us?</h4>
        <ul className="static-list">
          <li>
            <strong>Lightning Fast Delivery:</strong> We value your time. Our optimized routing 
            ensures your order reaches you as quickly as possible.
          </li>
          <li>
            <strong>Premium Quality:</strong> We partner directly with top-rated local farmers and 
            trusted brands to ensure that only the freshest products make it to your cart.
          </li>
          <li>
            <strong>Secure & Transparent:</strong> From encrypted payments to real-time order 
            tracking, we prioritize your security and peace of mind.
          </li>
        </ul>

        <h4>Our Story</h4>
        <p>
          Founded with a vision to simplify daily living, Shipzyy started as a small initiative 
          to bridge the gap between local vendors and consumers. Today, we are proud to serve 
          thousands of happy customers, continuously expanding our catalog and improving our 
          services to meet your everyday needs.
        </p>
      </div>
    </div>
  );
}

export default AboutUs;