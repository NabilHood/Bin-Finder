import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const BASE_URL = 'https://rv-n5oa.onrender.com';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/v1/user/profile`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        const loginData = {
          userEmail: formData.email,
          password: formData.password
        };

        // First, login
        const loginResponse = await fetch(`${BASE_URL}/v1/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(loginData)
        });

        const loginResult = await loginResponse.json();

        if (!loginResponse.ok) {
          throw new Error(loginResult.message || 'Login failed');
        }

        // Then, fetch user profile
        const profileData = await fetchUserProfile();
        
        // Transform API data to match your app's user structure
        const userData = {
          id: profileData.user?.username || formData.email,
          fullName: `${profileData.user?.firstname || ''} ${profileData.user?.lastname || ''}`.trim(),
          email: profileData.user?.email || formData.email,
          username: profileData.user?.username,
          points: profileData.user?.point || 0,
          accountStatus: profileData.user?.accountStatus,
          pinCount: profileData.pinCount,
          reportedPinCount: profileData.reportedPinCount
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/');
        
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ 
          submit: error.message || 'Invalid email or password. Please try again.' 
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Check for success message from signup redirect
  const successMessage = location.state?.message;

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
          <h1>Welcome Back</h1>
          <p>Sign in to your BinFinder account</p>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {errors.submit && <div className="error-text submit-error">{errors.submit}</div>}

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>

        <div className="app-features">
          <h3>BinFinder Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🗺️</span>
              <span>Interactive Recycling Map</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📸</span>
              <span>Photo Verification</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span>Earn Points & Rewards</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Track Your Impact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;