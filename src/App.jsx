import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/Auth/SignUp';
import Login from './components/Auth/Login';
import Dashboard from './components/Auth/Dashboard';
import Home from './components/Home/Home';
import FarmingSimulator from './components/Game/FarmingSimulator'; // Import the new game component
import Admin from './components/Admin/Admin';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on app load
  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Optional: Verify with backend that session is still valid
          try {
            const response = await fetch('https://rv-n5oa.onrender.com/v1/user/profile', {
              method: 'GET',
              credentials: 'include'
            });
            
            if (response.ok) {
              const profileData = await response.json();
              // Update user data with latest from backend
              const updatedUser = {
                ...userData,
                points: profileData.user?.point || userData.points,
                pinCount: profileData.pinCount,
                reportedPinCount: profileData.reportedPinCount,
                accountStatus: profileData.user?.accountStatus
              };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
              // Session invalid, clear local storage
              localStorage.removeItem('user');
            }
          } catch (error) {
            console.error('Session validation failed:', error);
            // Keep using stored user data as fallback
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Error checking existing user:', error);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingUser();
  }, []);

  if (isLoading) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={<Home user={user} />} 
          />
          <Route 
            path="/signup" 
            element={<SignUp setUser={setUser} />} 
          />
          <Route 
            path="/login" 
            element={<Login setUser={setUser} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin" 
            element={<Admin user={user} setUser={setUser} />} 
          />
          <Route
            path="/farm"
            element={<FarmingSimulator user={user} />}
          />
          {/* Add a catch-all route for undefined paths */}
          <Route 
            path="*" 
            element={<Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;