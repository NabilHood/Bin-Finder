import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Home.css';

// Temporary data
import { mapLocations } from './tempdata.js';

// Create bin icon for pin
const getIconStyle = (type) => {
  switch (type) {
    case 'Recycling Bin':
      return { color: '#2E8B57', icon: 'fa-trash-can' };
    case 'Recycling Centre':
      return { color: '#006400', icon: 'fa-recycle' };
    case 'Donation Bin':
      return { color: '#4173AF', icon: 'fa-shirt' };
    case 'Donation Centre':
      return { color: '#B22222', icon: 'fa-hand-holding-heart' };
    default:
      return { color: '#6A6A6A', icon: 'fa-location-pin' };
  }
};

const createPin = (type) => {
  const { color, icon } = getIconStyle(type);

  return L.divIcon({
    className: 'custom-fa-icon',
    html: `<div style="background-color: ${color};" class="marker-circle">
             <i class="fa-solid ${icon}"></i>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

function Home({ user }) {
  const position = [2.9278, 101.6419];  // Coordinates for the Cyberjaya for the map
  const navigate = useNavigate();

  // For category filter
  const categories = ['Recycling Bin', 'Recycling Centre', 'Donation Bin', 'Donation Centre'];

  const [selectedCategories, setSelectedCategories] = useState(categories);

  const [appliedCategories, setAppliedCategories] = useState(categories);

  const handleCheckboxChange = (category) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  }

  const applyFilter = () => {
    setAppliedCategories(selectedCategories);
  };

  const filteredLocations = mapLocations.filter(loc => appliedCategories.includes(loc.type));

  const handleLogout = () => {
    localStorage.removeItem('user');
    // Refresh the page to update the user state
    window.location.reload();
  }

  return (
    <div className="home-container">
      {/* Top Menu Bar */}
      <nav className="navbar">
        <div className="nav-logo">BinFinder</div>
        <div className="menu-right">
          {user ? (
            // Show user info and logout when logged in
            <div className="user-menu">
              <span className="welcome-text">Welcome, {user.fullName}!</span>
              <span className="user-points">{user.points} pts</span>
              <button className="nav-login-btn" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          ) : (
            // Show login button when not logged in
            <Link to="/login">
              <button className="nav-login-btn">Log In</button>
            </Link>
          )}
        </div>
      </nav>

      {/* Welcome Banner for logged-in users */}
      {user && (
        <div className="welcome-banner">
          <div className="welcome-content">
            <h2>Welcome back, {user.fullName}! 👋</h2>
            <p>You have <strong>{user.points} points</strong> • Continue your recycling journey in Cyberjaya</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="main-content">
        <MapContainer 
          center={position} 
          zoom={14.5} 
          scrollWheelZoom={true} 
          className="leaflet-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Loop through all pin */}
          {filteredLocations.map((location) => (
            <Marker 
              key={location.id}
              position={[location.lat, location.lng]}
              icon={createPin(location.type)} 
            >
              <Popup minWidth={300} maxWidth={500}>
                <div style={{ textAlign: 'center' }}>
                  <h3>{location.name}</h3>
                  <p style={{ margin: 0, color: 'gray' }}>{location.type}</p>
                  <hr style={{ margin: '5px 0' }}/>
                  <small>{location.address}</small>
                  <hr style={{ margin: '5px 0' }}/>
                  <button
                    className="navigate-btn"
                    onClick={() => handleNavigate(location.lat, location.lng)}
                    style={{ marginRight: '5px' }}
                  >
                    Navigate
                  </button>
                  {user && (
                    <>
                      <button className="report-btn">
                        Report Issue
                      </button>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="sidebar">
          {user ? (
            // Logged-in user sidebar
            <div className="user-sidebar">
              <div className="user-stats">
                <h3>Your Stats</h3>
                <div className="stat-item">
                  <span className="stat-label">Points Earned:</span>
                  <span className="stat-value">{user.points}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Pins Created:</span>
                  <span className="stat-value">{user.pinCount || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Reports Submitted:</span>
                  <span className="stat-value">{user.reportedPinCount || 0}</span>
                </div>
              </div>

              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <button className="action-btn">
                  📸 Add New Pin
                </button>
                <button className="action-btn">
                  📊 View Your Pins
                </button>
              </div>
            </div>
          ) : (
            // Guest user sidebar
            <div className="guest-sidebar">
              <div className="signup-promo">
                <h3>Join BinFinder Today!</h3>
                <p>Create an account to:</p>
                <ul>
                  <li>🏆 Earn points for recycling</li>
                  <li>📱 Track your impact</li>
                  <li>📍 Save favorite locations</li>
                  <li>👥 Join the community</li>
                </ul>
                <Link to="/signup">
                  <button className="signup-btn">Sign Up Free</button>
                </Link>
              </div>
            </div>
          )}

          {/* Category Filtering (for all users) */}
          <div className="dropdown-list">
            <p><b>Category</b></p>

            {categories.map(category => (
              <label key={category} className="dropdown-item">
                <input
                  type="checkbox"
                  value={category}
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCheckboxChange(category)}
                />
                {category}
              </label>
            ))}

              <button className="filter-btn" onClick={applyFilter}>Filter</button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Home;