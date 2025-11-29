import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Home.css';

// Create bin icon for pin
const getIconStyle = (type) => {
  switch (type) {
    case 'Recycling Bins':
      return { color: '#2E8B57', icon: 'fa-trash-can' };
    case 'Recycling Centres':
      return { color: '#006400', icon: 'fa-recycle' };
    case 'Donation Bins':
      return { color: '#4173AF', icon: 'fa-shirt' };
    case 'Donation Centres':
      return { color: '#B22222', icon: 'fa-hand-holding-heart' };
    default:
      return { color: '#6A6A6A', icon: 'fa-location-pin' };
  }
};

const createCustomIcon = (type) => {
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

function Home() {
  const position = [2.9278, 101.6419];  // Coordinates for the Cyberjaya for the map

  // For dropdown
  const [selectedCategories, setSelectedCategories] = useState([]);
  const categories = ['Recycling Bins', 'Recycling Centres', 'Donation Bins', 'Donation Centres'];
  const handleCheckboxChange = (category) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  }

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
          
          {/* Placeholder Pin */}
          <Marker
            position={position}
            icon={createCustomIcon("Recycling Bins")}
          >
            <Popup>Placeholder pin</Popup>
          </Marker>
        </MapContainer>

        <div className="sidebar">
          <p>Filtering & Report goes here</p>
            
            {/* Category Filtering */}
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

              <button className="filter-btn">Filter</button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
