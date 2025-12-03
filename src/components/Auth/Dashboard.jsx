import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ position: 'relative' }}>
        <button 
          onClick={() => navigate('/')} 
          className="close-button"
          aria-label="Close"
        >
          &times;
        </button>
        
        <div className="auth-header">
          <h1>Welcome to BinFinder!</h1>
          <p>Hello, {user.fullName}!</p>
        </div>
        
        <div className="user-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Points:</strong> {user.points} 🏆</p>
        </div>

        <div className="dashboard-features">
          <h3>Available Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>🗺️ Recycling Map</h4>
              <p>Find recycling locations in Cyberjaya</p>
            </div>
            <div className="feature-card">
              <h4>📸 Log Activity</h4>
              <p>Upload photos of your recycling</p>
            </div>
            <div className="feature-card">
              <h4>🏆 Earn Points</h4>
              <p>Get rewarded for eco-friendly actions</p>
            </div>
            <div className="feature-card">
              <h4>📊 Your Impact</h4>
              <p>Track your recycling history</p>
            </div>
          </div>
        </div>

        <button onClick={handleLogout} className="auth-button logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;