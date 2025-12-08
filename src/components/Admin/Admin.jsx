import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

function Admin() {
  const navigate = useNavigate();
  const BASE_URL = 'https://rv-n5oa.onrender.com';

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/v1/user/users`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access Denied.');
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

  // Delete user (ban)
  const deleteUser = async (userId, email) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const response = await fetch(`${BASE_URL}/v1/user/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`);
      }

      // Remove user from local state
      setUsers(prev => prev.filter(user => user._id !== userId));
      setFilteredUsers(prev => prev.filter(user => user._id !== userId));
      
      setMessage({ type: 'success', text: `User ${email} has been deleted successfully.` });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (err) {
      console.error('Delete error:', err);
      setMessage({ type: 'error', text: `Failed to delete user: ${err.message}` });
      
      // Clear error message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Make user admin
  const makeUserAdmin = async (userId, email) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const response = await fetch(`${BASE_URL}/v1/user/${userId}/make-admin`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to update user role: ${response.status}`);
      }

      const updatedUser = await response.json();
      
      // Update user in local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, role: updatedUser.role || 'admin' } : user
      ));
      
      setFilteredUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, role: updatedUser.role || 'admin' } : user
      ));
      
      setMessage({ type: 'success', text: `User ${email} is now an admin.` });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (err) {
      console.error('Admin update error:', err);
      setMessage({ type: 'error', text: `Failed to update user: ${err.message}` });
      
      // Clear error message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Search functionality
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.email?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term) ||
        user.firstname?.toLowerCase().includes(term) ||
        user.lastname?.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  };

  // Load users on component mount
  useEffect(() => {
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

    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading user list...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>
      
      {/* Message display */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {/* Search bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search users by email, username, or name..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <div className="user-count">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users table */}
      {filteredUsers.length > 0 ? (
        <div className="table-container">
          <table className="users-table">
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
              {filteredUsers.map((user) => (
                <tr key={user._id || user.email}>
                  <td>{user.email || 'N/A'}</td>
                  <td>{user.username || 'N/A'}</td>
                  <td>{user.firstname || 'N/A'}</td>
                  <td>{user.lastname || 'N/A'}</td>
                  <td>
                    <span className={`role-badge ${user.role || 'user'}`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td>{user.point || '0'}</td>
                  <td className="actions-cell">
                    {/* Make Admin Button - only show if user is not already admin */}
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => makeUserAdmin(user._id, user.email)}
                        disabled={actionLoading[user._id]}
                        className="btn-admin"
                        title="Make Admin"
                      >
                        {actionLoading[user._id] ? 'Processing...' : 'Make Admin'}
                      </button>
                    )}
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
                          deleteUser(user._id, user.email);
                        }
                      }}
                      disabled={actionLoading[user._id]}
                      className="btn-delete"
                      title="Delete User"
                    >
                      {actionLoading[user._id] ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-users">
          {searchTerm ? 'No users match your search.' : 'No users found.'}
        </div>
      )}
    </div>
  );
}

export default Admin;