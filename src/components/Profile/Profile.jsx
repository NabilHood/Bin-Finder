import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Logo from '../../assets/BinFinderLogo.png';
import './Profile.css';

const Profile = ({ user }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const BASE_URL = 'https://rv-n5oa.onrender.com';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v1/user/profile`, {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        setProfileData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">Error: {error}</div>
        <button onClick={() => navigate('/')} className="back-btn">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <nav className="navbar">
        <div className="logo-title">
          <img src={Logo} height={50} alt="Logo" />
          <div className="nav-title">BinFinder</div>
        </div>
        <div className="menu-right">
          <div className="user-menu">
            <div className="dropdown-wrapper">
              <button
                className="dropdown-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                Menu <span>{dropdownOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
              </button>
            </div>

            {dropdownOpen && (
              <div className="dropdown-panel">
                <button className="dropdown-item" onClick={() => navigate('/')}>
                  Home
                </button>
                <button className="dropdown-item" onClick={() => navigate('/leaderboard')}>
                  Leaderboard
                </button>
                <button className="dropdown-item" onClick={() => navigate('/farm')}>
                  Minigame
                </button>
                <button className="dropdown-item" onClick={() => navigate('/admin')}>
                  Admin Controls
                </button>
              </div>
            )}
            
            <span className="welcome-text">Welcome, {user.fullName}!</span>
            <span className="user-points">{user.points} pts</span>

            <button className="nav-login-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1>{user.fullName}</h1>
          <p className="username">@{user.username}</p>
          <p className="email">{user.email}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card points-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <h3>Points</h3>
              <p className="stat-value">{profileData?.user?.point || user.points || 0}</p>
            </div>
          </div>

          <div className="stat-card pins-card">
            <div className="stat-icon">📍</div>
            <div className="stat-info">
              <h3>Pins Created</h3>
              <p className="stat-value">{profileData?.pinCount || user.pinCount || 0}</p>
            </div>
          </div>

          <div className="stat-card reports-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Reports Submitted</h3>
              <p className="stat-value">{profileData?.reportedPinCount || user.reportedPinCount || 0}</p>
            </div>
          </div>

          <div className="stat-card status-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Account Status</h3>
              <p className="stat-value status">
                {profileData?.user?.accountStatus || user.accountStatus || 'Active'}
              </p>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <h2>Profile Information</h2>
          <div className="detail-group">
            <div className="detail-item">
              <span className="detail-label">Full Name:</span>
              <span className="detail-value">{user.fullName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Username:</span>
              <span className="detail-value">{user.username}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">User ID:</span>
              <span className="detail-value">{user.id}</span>
            </div>
          </div>
        </div>

        <div className="achievements-section">
          <h2>Achievements</h2>
          <div className="achievements-grid">
            <div className={`achievement ${(user.points || 0) >= 100 ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">🌟</div>
              <div className="achievement-name">First 100 Points</div>
              <div className="achievement-desc">Earn 100 points</div>
            </div>

            <div className={`achievement ${(user.pinCount || 0) >= 5 ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">📌</div>
              <div className="achievement-name">Pin Master</div>
              <div className="achievement-desc">Create 5 pins</div>
            </div>

            <div className={`achievement ${(user.reportedPinCount || 0) >= 3 ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">🔍</div>
              <div className="achievement-name">Eagle Eye</div>
              <div className="achievement-desc">Submit 3 reports</div>
            </div>

            <div className={`achievement ${(user.points || 0) >= 500 ? 'unlocked' : 'locked'}`}>
              <div className="achievement-icon">💎</div>
              <div className="achievement-name">Eco Champion</div>
              <div className="achievement-desc">Earn 500 points</div>
            </div>
          </div>
        </div>

        <div className="activity-summary">
          <h2>Impact Summary</h2>
          <div className="impact-stats">
            <p>
              🌍 You've contributed <strong>{user.pinCount || 0}</strong> recycling locations to the community
            </p>
            <p>
              ⭐ You've earned <strong>{user.points || 0}</strong> points for your eco-friendly actions
            </p>
            <p>
              📢 You've helped improve accuracy with <strong>{user.reportedPinCount || 0}</strong> reports
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
