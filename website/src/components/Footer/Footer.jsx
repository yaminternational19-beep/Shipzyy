import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import logo from "../../assets/logosvg.svg";

function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-gradient-border"></div>

      <div className="container-max">
        <div className="footer-top">
          <div className="brand-area">
            <div className="logo-flex">
              <img src={logo} alt="Shipzyy" className="footer-brand-img" />
              <h2 className="footer-brand-text">Ship<span>zyy</span></h2>
            </div>
            <p className="brand-desc">
              Experience the future of delivery. Fresh groceries, latest tech, and 
              premium essentials delivered in minutes, not hours.
            </p>
            
            <div className="app-buttons">
              <a href="https://apple.com" target="_blank" rel="noreferrer" className="app-btn">
                <span className="icon"></span>
                <div className="text">
                  <small>Download on the</small>
                  <strong>App Store</strong>
                </div>
              </a>
              <a href="https://play.google.com" target="_blank" rel="noreferrer" className="app-btn">
                <span className="icon">▶</span>
                <div className="text">
                  <small>Get it on</small>
                  <strong>Google Play</strong>
                </div>
              </a>
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="link-col">
              <h4>Support</h4>
              <ul>
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/return-policy">Return Policy</Link></li>
              </ul>
            </div>

            <div className="link-col">
              <h4>Categories</h4>
              <ul>
                <li><Link to="/shop?category=grocery">Fresh Food</Link></li>
                <li><Link to="/shop?category=electronics">Electronics</Link></li>
                <li><Link to="/shop?category=fashion">Fashion</Link></li>
                <li><Link to="/shop?category=beauty">Beauty</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="footer-bottom">
          <div className="copyright-area">
            <p>© 2026 Shippzyy Inc. All rights reserved.</p>
            {/* 🔥 Design Credit Line Added 🔥 */}
            <p className="developer-credit">
              Designed and developed by <span>Blackcube Solutions LLC</span>
            </p>
          </div>
          
          <div className="payment-icons">
            <span className="pay-card">Visa</span>
            <span className="pay-card">Mastercard</span>
            <span className="pay-card">UPI</span>
            <span className="pay-card">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;