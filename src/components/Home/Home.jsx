import React, { useState, useEffect, useRef, useActionState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Logo from "../../assets/BinFinderLogo.png";
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
  const mapCenter = [2.9278, 101.6419];  // Coordinates for the Cyberjaya for the map
  const navigate = useNavigate();
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  // Adding pin
  const [isAddingPin, setShowAddingPin] = useState(false);

  const [selectedPinTypeToAdd, setSelectedPinType] = useState("Recycling Bin");

  const setIsAddingPin = () => {
    setShowAddingPin(prev => !prev);
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    // Refresh the page to update the user state
    window.location.reload();
  }
  
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [address3, setAddress3] = useState("");
  const [description, setDescription] = useState("");

  const submitNewPin = async (lat, lng, address1, address2, address3, description) => {
    const fullAddress = address1 + " " + address2 + " " + address3;

    if (!lat || !lng) {
      alert("Unable to detect your location, please try again.");
      return;

    } else if (!fullAddress.trim() || !description.trim()) {
      alert("Please fill in all the required information.");
      return;
    }

    setIsLoadingAction(true);

    try {
      const newPinData = {
        location: {
          longitude: lng,
          latitude: lat
        },
        adder: fullAddress,
        type: selectedPinTypeToAdd,
        infomation: description
      };
      console.log(newPinData)

      const response = await fetch('https://rv-n5oa.onrender.com/v1/pin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newPinData)
      });

      if (!response.ok) {
        setIsLoadingAction(false)
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Pin created:', result);
      alert("Your pin has been successfully submitted!");

      setShowAddingPin(false);
      setIsLoadingAction(false);

    } catch (error) {
      console.error('Error creating pin:', error);
      alert('Failed to create pin. Please try again.');
      setIsLoadingAction(false);
    }
  };

  // Get user location
  const [userLocation, setUserLocation] = useState(null);

  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Set the user location pin
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location.");
      }
    );
  }

  function FlyToUserLocation({ userLocation }) {
    const map = useMap();

    useEffect(() => {
      if (userLocation) {
        map.flyTo([userLocation.lat, userLocation.lng], 14.5, {
          duration: 2 
        });
      }
    }, [userLocation, map]);

    return null;
  }

  useEffect(() => {
    handleGetUserLocation();
  }, []);

  return (
    <div className="home-container">
      {/* Top Menu Bar */}
      <nav className="navbar">
        <div className="logo-title">
          <img src={Logo} height={50} alt="Logo" />
          <div className="nav-title">BinFinder</div>
        </div>
        <div className="menu-right">
          {user ? (
            // Show user info and logout when logged in
            <div className="user-menu">
              <div className="dropdown-wrapper">
                <button
                  className="dropdown-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  disabled={isLoadingAction}
                >
                  Menu <span>{dropdownOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
                </button>
              </div>

                {dropdownOpen && (
                  <div className="dropdown-panel">
                    <button className="dropdown-item" onClick={() => navigate('/profile')}>
                      Profile
                    </button>
                    <button className="dropdown-item" onClick={() => navigate('/farm')}>
                      Minigame
                    </button>

                    {/* Button to Admin Page, currently available for everyone including users */}
                    <button className="dropdown-item" onClick={() => navigate('/admin')}>
                      Admin Controls
                    </button>
                  </div>
                )}
              
              <span className="welcome-text">Welcome, {user.fullName}!</span>
              <span className="user-points">{user.points} pts</span>
              <button className="nav-login-btn" onClick={handleLogout} disabled={isLoadingAction}>
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
        {/* Map */}
        <MapContainer 
          center={mapCenter}
          zoom={14.5} 
          scrollWheelZoom={true} 
          className="leaflet-container"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FlyToUserLocation userLocation={userLocation} />

          {/* User Location Pin */}
          {userLocation && (
            <>
            <CircleMarker 
              center={[userLocation.lat, userLocation.lng]}
              radius={9} 
              pathOptions={{ 
                color: 'white', 
                fillColor: '#007bff',
                fillOpacity: 1,
                weight: 2
              }}
            >
              <Popup>You are here</Popup>
            </CircleMarker>
            
            {isAddingPin && (
              <>
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={createPin(selectedPinTypeToAdd)}
                >
                  <Popup>
                    <b>Adding a pin to your location</b>
                  </Popup>
                </Marker>
                <div className="map-overlay">
                  <h3>Adding a pin to your location</h3>
                </div>
              </>
            )}
            </>
          )}
          
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
            <>
            {isAddingPin ? (
              <div className='category-list'>
                <button className="action-btn" onClick={setIsAddingPin} disabled={isLoadingAction}>
                  Back
                </button>

                <p><b>Select pin type:</b></p>

                {categories.map((category) => (
                  <label key={category} className='category-item'>
                    <input
                      type="radio"
                      name="pinType"
                      value={category}
                      checked={selectedPinTypeToAdd === category}
                      onChange={() => setSelectedPinType(category)}
                    />
                    {category}
                  </label>
                ))}

                <div className='address-form'>
                  <p><b>Address:</b></p>

                  <input className='text-input'
                    type='text'
                    placeholder='No.1, Jalan Dua, Taman Tiga,'
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                  />
                  <input className='text-input'
                    type='text'
                    placeholder='45678, Negeri Sembilan'
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                  />
                  <input className='text-input'
                    type='text'
                    placeholder="..."
                    value={address3}
                    onChange={(e) => setAddress3(e.target.value)}
                  />
                </div>

                <div className='address-form'>
                  <p><b>Description:</b></p>

                  <input className='text-input'
                    type='text'
                    placeholder='A DIY mini recycle bin?'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <button
                  className='action-btn'
                  onClick={() => submitNewPin(userLocation.lat, userLocation.lng, address1, address2, address3, description)}
                  disabled={isLoadingAction}
                >
                  {isLoadingAction ? "Submitting..." : "Submit"}
                </button>

              </div>
            ) : (
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
                  <button className="action-btn" onClick={setIsAddingPin}>
                    📸 Add New Pin
                  </button>
                  <button className="action-btn">
                    📊 View Your Pins
                  </button>
                </div>
              </div>
            )}
          </>
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

          {!isAddingPin && (
            // Category Filtering (for all users)
            <div className="category-list">
              <p><b>Category</b></p>

              {categories.map(category => (
                <label key={category} className="category-item">
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
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;