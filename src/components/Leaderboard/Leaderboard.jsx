import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Logo from '../../assets/BinFinderLogo.png';
import './Leaderboard.css';

const Leaderboard = ({ user }) => {
  const navigate = useNavigate();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const BASE_URL = 'https://rv-n5oa.onrender.com';

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v1/user/leaderboard`, {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }

        const data = await response.json();
        console.log('Leaderboard data:', data);
        setLeaderboardData(data.leaderboard || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getEcoIcon = (rank) => {
    const icons = ['🌳', '🌲', '🌱', '🌿', '🍃', '♻️', '🌍', '💚', '🌾'];
    return icons[rank - 1] || '🌿';
  };

  if (isLoading) {
    return (
      <div className="leaderboard-container">
        <div className="loading">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo-title">
          <img src={Logo} height={50} alt="Logo" />
          <div className="nav-title">BinFinder</div>
        </div>
        <div className="menu-right">
          {user ? (
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
                  <button className="dropdown-item" onClick={() => navigate('/profile')}>
                    Profile
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
          ) : (
            <button className="nav-login-btn" onClick={() => navigate('/login')}>
              Log In
            </button>
          )}
        </div>
      </nav>

      {/* Leaderboard Content */}
      <div className="leaderboard-content">
        <div className="leaderboard-header">
          <h1>🏆 Top Contributors</h1>
          <p>Compete with other eco-warriors and climb the ranks!</p>
        </div>

        {/* Top 3 Podium */}
        {leaderboardData.length >= 3 && (
          <div className="podium">
            <div className="podium-place second">
              <div className="podium-medal">🥈</div>
              <div className="podium-avatar">🌲</div>
              <div className="podium-name">{leaderboardData[1].fullName || leaderboardData[1].username}</div>
              <div className="podium-points">{leaderboardData[1].point} pts</div>
            </div>
            <div className="podium-place first">
              <div className="podium-crown">👑</div>
              <div className="podium-medal">🥇</div>
              <div className="podium-avatar">🌳</div>
              <div className="podium-name">{leaderboardData[0].fullName || leaderboardData[0].username}</div>
              <div className="podium-points">{leaderboardData[0].point} pts</div>
            </div>
            <div className="podium-place third">
              <div className="podium-medal">🥉</div>
              <div className="podium-avatar">🌱</div>
              <div className="podium-name">{leaderboardData[2].fullName || leaderboardData[2].username}</div>
              <div className="podium-points">{leaderboardData[2].point} pts</div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Points</th>
                <th>Pins Created</th>
                <th>Reports</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((userData, index) => {
                const isCurrentUser = user && userData.email === user.email;
                return (
                  <tr key={userData.id || index} className={isCurrentUser ? 'current-user' : ''}>
                    <td className="rank-cell">
                      <span className="rank">{getRankMedal(index + 1)}</span>
                    </td>
                    <td className="user-cell">
                      <div className="user-avatar">
                        {getEcoIcon(index + 1)}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{userData.fullName || userData.username}</div>
                        <div className="user-email">{userData.email}</div>
                      </div>
                      {isCurrentUser && <span className="you-badge">YOU</span>}
                    </td>
                    <td className="points-cell">
                      <span className="points">{userData.point}</span>
                    </td>
                    <td className="stat-cell">{userData.pinCount || 0}</td>
                    <td className="stat-cell">{userData.reportedPinCount || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {leaderboardData.length === 0 && (
          <div className="no-data">
            <p>No leaderboard data available yet. Be the first to contribute!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
