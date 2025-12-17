import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from "../../assets/BinFinderLogo.png";
import './Admin.css';

function Admin({ user, setUser }) {
  const navigate = useNavigate();
  const BASE_URL = 'https://rv-n5oa.onrender.com';

  // User states
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pin states
  const [pins, setPins] = useState([]);
  const [pendingAddPins, setPendingAddPins] = useState([]);
  const [pendingDelPins, setPendingDelPins] = useState([]);
  const [pinsLoading, setPinsLoading] = useState(true);
  const [pinsError, setPinsError] = useState(null);
  
  // Search and loading states
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  // Search functionality for users
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(u => 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastname?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/v1/user/users`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access Denied. Admin privileges required.');
        }
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Fetch error:', error.message);
      throw error;
    }
  };

  // Fetch all pins data
  const fetchAllPins = async () => {
    try {
      const response = await fetch(`${BASE_URL}/v1/pin/admin/list`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access Denied.');
        }
        throw new Error(`Failed to fetch pins: ${response.status}`);
      }

      const data = await response.json();

      return {
        pendingAdditions: data.pendingPinForAddition || [],
        pendingDeletions: data.pendingPinForDeletion || [],
        allPins: data.pins || []
      };

    } catch (error) {
      console.error('Fetch error:', error.message);
      throw error;
    }
  };

  // User management functions
  const handleMakeAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to make this user an admin?')) {
      return;
    }

    setIsLoadingAction(true);
    try {
      const response = await fetch(`${BASE_URL}/v1/user/change/role/${userId}/admin`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        alert('User role updated to admin successfully!');
        loadUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleMakeUser = async (userId) => {
    if (!window.confirm('Are you sure you want to change this admin to regular user?')) {
      return;
    }

    setIsLoadingAction(true);
    try {
      const response = await fetch(`${BASE_URL}/v1/user/change/role/${userId}/user`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        alert('User role updated to regular user successfully!');
        loadUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleBanUser = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to ban/delete user: ${email}? This action cannot be undone.`)) {
      return;
    }

    setIsLoadingAction(true);
    try {
      const response = await fetch(`${BASE_URL}/v1/user/delete/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('User banned/deleted successfully!');
        loadUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to ban user');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Pin management functions - UPDATED WITH CORRECT ENDPOINTS
  const handleApproveAddition = async (pinId) => {
    if (!window.confirm('Approve and activate this pin?')) {
      return;
    }

    setIsLoadingAction(true);
    try {
      const response = await fetch(`${BASE_URL}/v1/pin/center/a/${pinId}`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Pin approved and activated!');
        loadPins();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve pin');
      }
    } catch (error) {
      console.error('Error approving pin:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleRejectAddition = async (pinId) => {
    if (!window.confirm('Reject this pin addition?')) {
      return;
    }

    setIsLoadingAction(true);
    try {
      const response = await fetch(`${BASE_URL}/v1/pin/center/r/${pinId}`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Pin addition rejected!');
        loadPins();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject pin');
      }
    } catch (error) {
      console.error('Error rejecting pin:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleApproveDeletion = async (pinId) => {
    if (!window.confirm('Approve this pin deletion? This will permanently delete the pin.')) {
      return;
    }

    setIsLoadingAction(true);
    try {
      const response = await fetch(`${BASE_URL}/v1/pin/center/drp/${pinId}`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Pin deleted successfully!');
        loadPins();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete pin');
      }
    } catch (error) {
      console.error('Error approving deletion:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleRejectDeletion = async (pinId) => {
    if (!window.confirm('Reject this pin deletion request? The pin will remain active.')) {
      return;
    }

    setIsLoadingAction(true);
    try {
      const response = await fetch(`${BASE_URL}/v1/pin/center/rrp/${pinId}`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Pin deletion rejected - pin remains active!');
        loadPins();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject deletion');
      }
    } catch (error) {
      console.error('Error rejecting deletion:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Load data functions
  const loadUsers = async () => {
    try {
      const data = await fetchAllUsers();
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPins = async () => {
    try {
      const data = await fetchAllPins();
      
      setPins(data.allPins || []);
      setPendingAddPins(data.pendingAdditions || []);
      setPendingDelPins(data.pendingDeletions || []);
      setPinsError(null);
    } catch (err) {
      setPinsError(err.message);
      setPins([]);
      setPendingAddPins([]);
      setPendingDelPins([]);
    } finally {
      setPinsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    loadUsers();
    loadPins();
  }, []);

  if (loading || pinsLoading) {
    return (
      <div className="admin-container">
        <p>Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <nav className="navbar">
        <div className="logo-title">
          <img src={Logo} height={50} alt="Logo" />
          <div className="nav-title">BinFinder Admin</div>
        </div>
        <div className="menu-right">
          {user ? (
            <div className="user-menu">
              <button
                className="nav-login-btn"
                onClick={() => navigate('/')}
              >
                Main Page
              </button>

              <span className="welcome-text">Welcome, {user.fullName}!</span>
              <span className="user-points">{user.points} pts</span>

              <button className="nav-login-btn" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="nav-login-btn">Log In</button>
            </Link>
          )}
        </div>
      </nav>

      <div className="admin-content">
        <h1>Admin Dashboard</h1>
        
        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management ({users.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pins' ? 'active' : ''}`}
            onClick={() => setActiveTab('pins')}
          >
            All Pins ({pins.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pendingAdd' ? 'active' : ''}`}
            onClick={() => setActiveTab('pendingAdd')}
          >
            Pending Additions ({pendingAddPins.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pendingDel' ? 'active' : ''}`}
            onClick={() => setActiveTab('pendingDel')}
          >
            Pending Deletions ({pendingDelPins.length})
          </button>
        </div>

        {isLoadingAction && (
          <div className="loading-overlay">
            Processing action...
          </div>
        )}

        {/* USER MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="tab-content">
            {/* Search Bar */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Search users by email, username, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
              >
                Clear
              </button>
            </div>

            <div className="User_List">
              <h2>User Management ({filteredUsers.length} users)</h2>

              <table className="_table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Username</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Role</th>
                    <th>Points</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((userItem, index) => (
                      <tr key={index}>
                        <td>{userItem.email || 'N/A'}</td>
                        <td>{userItem.username || 'N/A'}</td>
                        <td>{userItem.firstname || 'N/A'}</td>
                        <td>{userItem.lastname || 'N/A'}</td>
                        <td>
                          <span className={`role-badge ${userItem.role === 'admin' ? 'admin-role' : 'user-role'}`}>
                            {userItem.role || 'user'}
                          </span>
                        </td>
                        <td>{userItem.point || '0'}</td>
                        <td className="action-buttons">
                          {userItem.role !== 'admin' ? (
                            <button
                              onClick={() => handleMakeAdmin(userItem.id || userItem._id)}
                              className="action-btn make-admin-btn"
                              disabled={isLoadingAction}
                            >
                              Make Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMakeUser(userItem.id || userItem._id)}
                              className="action-btn make-user-btn"
                              disabled={isLoadingAction}
                            >
                              Make User
                            </button>
                          )}
                          <button
                            onClick={() => handleBanUser(userItem.id || userItem._id, userItem.email)}
                            className="action-btn ban-btn"
                            disabled={isLoadingAction}
                          >
                            Ban User
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", fontStyle: "italic" }}>
                        {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALL PINS TAB */}
        {activeTab === 'pins' && (
          <div className="tab-content">
            <div className="Pins_List">
              <h2>All Pins ({pins.length})</h2>

              <table className="_table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Location</th>
                    <th>Information</th>
                    <th>Address</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pins.length > 0 ? (
                    pins.map((pin, index) => (
                      <tr key={index}>
                        <td className="pin-id">{pin.id?.substring(0, 8) || pin._id?.substring(0, 8) || 'N/A'}</td>
                        <td>
                          {pin.location
                            ? `${pin.location.latitude?.toFixed(6)}, ${pin.location.longitude?.toFixed(6)}`
                            : 'N/A'}
                        </td>
                        <td>{pin.infomation || pin.information || 'N/A'}</td>
                        <td>{pin.adder || 'N/A'}</td>
                        <td>
                          <span className={`type-badge ${pin.type?.replace(/\s+/g, '-').toLowerCase()}`}>
                            {pin.type || 'Unknown'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${pin.status === 'active' ? 'active' : 'pending'}`}>
                            {pin.status || 'pending'}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button
                            onClick={() => handleApproveDeletion(pin.id || pin._id)}
                            className="action-btn delete-btn"
                            disabled={isLoadingAction}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", fontStyle: "italic" }}>
                        No pins found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PENDING ADDITIONS TAB */}
        {activeTab === 'pendingAdd' && (
          <div className="tab-content">
            <div className="Pend_Add_List">
              <h2>Pending Pins For Addition ({pendingAddPins.length})</h2>

              <table className="_table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Location</th>
                    <th>Information</th>
                    <th>Address</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pendingAddPins.length > 0 ? (
                    pendingAddPins.map((pin, index) => (
                      <tr key={index}>
                        <td className="pin-id">{pin.id?.substring(0, 8) || pin._id?.substring(0, 8) || 'N/A'}</td>
                        <td>
                          {pin.location
                            ? `${pin.location.latitude?.toFixed(6)}, ${pin.location.longitude?.toFixed(6)}`
                            : 'N/A'}
                        </td>
                        <td>{pin.infomation || pin.information || 'N/A'}</td>
                        <td>{pin.adder || 'N/A'}</td>
                        <td>
                          <span className={`type-badge ${pin.type?.replace(/\s+/g, '-').toLowerCase()}`}>
                            {pin.type || 'Unknown'}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button
                            onClick={() => handleApproveAddition(pin.id || pin._id)}
                            className="action-btn approve-btn"
                            disabled={isLoadingAction}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectAddition(pin.id || pin._id)}
                            className="action-btn reject-btn"
                            disabled={isLoadingAction}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", fontStyle: "italic" }}>
                        No pending pins to add.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PENDING DELETIONS TAB */}
        {activeTab === 'pendingDel' && (
          <div className="tab-content">
            <div className="Pend_Del_List">
              <h2>Pending Pins For Deletion ({pendingDelPins.length})</h2>

              <table className="_table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Location</th>
                    <th>Information</th>
                    <th>Address</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pendingDelPins.length > 0 ? (
                    pendingDelPins.map((pin, index) => (
                      <tr key={index}>
                        <td className="pin-id">{pin.id?.substring(0, 8) || pin._id?.substring(0, 8) || 'N/A'}</td>
                        <td>
                          {pin.location
                            ? `${pin.location.latitude?.toFixed(6)}, ${pin.location.longitude?.toFixed(6)}`
                            : 'N/A'}
                        </td>
                        <td>{pin.infomation || pin.information || 'N/A'}</td>
                        <td>{pin.adder || 'N/A'}</td>
                        <td>
                          <span className={`type-badge ${pin.type?.replace(/\s+/g, '-').toLowerCase()}`}>
                            {pin.type || 'Unknown'}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button
                            onClick={() => handleApproveDeletion(pin.id || pin._id)}
                            className="action-btn delete-btn"
                            disabled={isLoadingAction}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleRejectDeletion(pin.id || pin._id)}
                            className="action-btn reject-btn"
                            disabled={isLoadingAction}
                          >
                            Keep Active
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", fontStyle: "italic" }}>
                        No pending pins to delete.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;