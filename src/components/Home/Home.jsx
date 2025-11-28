import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      {/* Top Menu Bar */}
      <nav className="navbar">
        <div className="nav-logo">BinFinder</div>
        <div className="menu-right">
          <Link to="/login">
            <button className="nav-login-btn">Log In</button>
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="main-content">
        <p>Interactive map goes here</p>
      </div>
    </div>
  );
}

export default Home;