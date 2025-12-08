import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Admin.css';

function Admin({ user, handleLogout }) {
  const navigate = useNavigate();
  const BASE_URL = 'https://rv-n5oa.onrender.com';

  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const[pins, setPins] = useState(null);
  const [pinsLoading, setPinsLoading] = useState(true);
  const [pinsError, setPinsError] = useState(null);
  
  const[add_pins, setAddPins] = useState(null);
  const [add_pinsLoading, setAddPinsLoading] = useState(true);
  const [add_pinsError, setAddPinsError] = useState(null);

  const[del_pins, setDelPins] = useState(null);
  const [del_pinsLoading, setDelPinsLoading] = useState(true);
  const [del_pinsError, setDelPinsError] = useState(null);

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

  const fetchAllPins = async () => {
    try{
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

    const pendingAdditions = data.add_pins;
    const pendingDeletions = data.del_pins;
    const allPins = data.pins;

    return { pendingAdditions, pendingDeletions, allPins };
    } catch (error) {
      console.error('Fetch error:', error.message);
      throw error;
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchAllUsers();
        setUsers(data.users);
        setError(null);
      } catch (err) {
        setError(err.message);
        setUsers(null);
      } finally {
        setLoading(false);
      }
    };

    const loadPins = async () => {
      try {
        const data = await fetchAllPins();
        setPins(data.allPins);
        setPinsError(null);
      } catch (err) {
        setPinsError(err.message);
        setPins(null);
      } finally {
        setPinsLoading(false);
      }
    };

    loadPins();

    loadUsers();
  }, [BASE_URL]);

  if (loading) {
    return <p>Loading user list...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>

      <nav className="navbar">
        <div className="nav-logo">BinFinder</div>

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

      <div class="User_List">
        <h2>User List</h2>

        <table class="_table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Role</th>
              <th>Point</th>
            </tr>
          </thead>

          <tbody>
            {users && users.length > 0 ? (
              users.map((user, index) => (
                <tr key={index}>
                  <td>{user.email || 'N/A'}</td>
                  <td>{user.username || 'N/A'}</td>
                  <td>{user.firstname || 'N/A'}</td>
                  <td>{user.lastname || 'N/A'}</td>
                  <td>{user.role || 'N/A'}</td>
                  <td>{user.point || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", fontStyle: "italic" }}>
                  No users found or empty list.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div class="Pins_List">
        <h2>Pins List</h2>

        <table class="_table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Information</th>
              <th>Address</th>
              <th>Type</th>
            </tr>
          </thead>

          <tbody>
            {pins && pins.length > 0 ? (
              pins.map((pin, index) => (
                <tr key={index}>
                  <td>
                    {pin.location
                      ? `${pin.location.latitude}, ${pin.location.longitude}`
                      : 'N/A'}
                  </td>
                  <td>{pin.infomation || pin.information || 'N/A'}</td>
                  <td>{pin.adder || 'N/A'}</td>
                  <td>{pin.type || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", fontStyle: "italic" }}>
                  No pins found or empty list.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div class="Pend_Add_List">
        <h2>Pending Pins For Addition</h2>

        <table class="_table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Information</th>
              <th>Address</th>
              <th>Type</th>
            </tr>
          </thead>

          <tbody>
            {add_pins && add_pins.length > 0 ? (
              add_pins.map((pin, index) => (
                <tr key={index}>
                  <td>
                    {pin.location
                      ? `${pin.location.latitude}, ${pin.location.longitude}`
                      : 'N/A'}
                  </td>
                  <td>{pin.infomation || pin.information || 'N/A'}</td>
                  <td>{pin.adder || 'N/A'}</td>
                  <td>{pin.type || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                {/* span across all table columns */}
                <td colSpan="4" style={{ textAlign: "center", fontStyle: "italic" }}>
                  No pending pins to add.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div class="Pend_Del_List">
        <h2>Pending Pins For Deletion</h2>

        <table class="_table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Information</th>
              <th>Address</th>
              <th>Type</th>
            </tr>
          </thead>

          <tbody>
            {del_pins && del_pins.length > 0 ? (
              del_pins.map((pin, index) => (
                <tr key={index}>
                  <td>
                    {pin.location
                      ? `${pin.location.latitude}, ${pin.location.longitude}`
                      : 'N/A'}
                  </td>
                  <td>{pin.infomation || pin.information || 'N/A'}</td>
                  <td>{pin.adder || 'N/A'}</td>
                  <td>{pin.type || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                {/* span across all table columns */}
                <td colSpan="4" style={{ textAlign: "center", fontStyle: "italic" }}>
                  No pending pins to delete.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Admin;