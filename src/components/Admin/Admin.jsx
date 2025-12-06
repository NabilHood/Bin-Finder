import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const navigate = useNavigate();
  const BASE_URL = 'https://rv-n5oa.onrender.com';

  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <h2>User List</h2>
      {users && users.length > 0 ? (
        <table>
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
            {users.map((user, index) => (
              <tr key={index}>
                <td>{user.email || 'N/A'}</td>
                <td>{user.username || 'N/A'}</td>
                <td>{user.firstname || 'N/A'}</td>
                <td>{user.lastname || 'N/A'}</td>
                <td>{user.role || 'N/A'}</td>
                <td>{user.point || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No users found or empty list.</p>
      )}
    </div>
  );
}

export default Admin;