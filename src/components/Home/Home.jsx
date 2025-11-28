import React from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Home.css';

// Create bin icon for pin
const createBinIcon = () => {
  const color = '#2E8B57';

  return L.divIcon({
    className: 'custom-fa-icon',
    html: `<div style="background-color: ${color};" class="marker-circle">
             <i class="fa-solid fa-trash-can"></i>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
}

function Home() {
  const position = [2.9278, 101.6419];  // Coordinates for the Cyberjaya for the map
  const binIcon = createBinIcon();      // Bin icon for pin

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
          <Marker position={position} icon={binIcon}>
            <Popup>Placeholder pin</Popup>
          </Marker>
        </MapContainer>

        <div className="sidebar">
          <p>Filtering & Report goes here</p>
        </div>
      </div>
    </div>
  );
}

export default Home;