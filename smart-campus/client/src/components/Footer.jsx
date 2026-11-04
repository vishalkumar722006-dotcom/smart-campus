import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">🏛 SmartCampus</div>
          <p>University Resource Booking Portal — making campus resource management simple and efficient.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-links">
          <h4>Resources</h4>
          <Link to="/resources">Browse All</Link>
          <Link to="/my-bookings">My Bookings</Link>
          <Link to="/profile">Profile</Link>
        </div>
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>📧 support@smartcampus.edu</p>
          <p>📞 +91 98765 43210</p>
          <p>📍 University Campus, India</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 SmartCampus. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
