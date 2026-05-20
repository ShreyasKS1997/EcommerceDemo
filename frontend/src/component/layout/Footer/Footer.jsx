import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer id="footer">
      <div className="leftFooter">
        <h3>Download our App</h3>
        <p>Download App for Android and IOS mobile phone</p>
        <div>
          <img src='/google-play-store-icon.png' alt="Playstore" />
          <img src='/App_Store_(iOS)-Logo.wine.png' alt="AppStore" />
        </div>
      </div>

      <div className="midFooter">
        <h1>Ecommerce</h1>
        <p>Copyrights {new Date().getFullYear()} &copy; ECOMMERCE</p>
      </div>

      <div className="rightFooter">
        <h5>Follow us</h5>
        <div className="socialIcons">
          <img src='/youtube.png' alt="Youtube" />
          <img src='/facebook-logo.png' alt="Facebook" />
          <img src='/instagram-icon.png' alt="Instagram" />
          <img src='/x-icon.png' alt="Twitter" />
          <img src="/linkedIn-logo.png" alt="LinkedIn"/>
        </div>
        <Link to='/about'><h5>About</h5></Link>
        <Link to='/contact'><h5>Contact Us</h5></Link>
      </div>
    </footer>
  );
}

export default Footer;
