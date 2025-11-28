import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Simulate API call
        const userData = {
          id: 1,
          fullName: 'Demo User',
          email: formData.email,
          userType: 'resident',
          points: 150
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/dashboard');
      } catch (error) {
        setErrors({ submit: 'Invalid email or password' });
      }
    }
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
          <h1>Welcome Back</h1>
          <p>Sign in to your BinFinder account</p>
        </div>

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

          <button type="submit" className="auth-button">
            Sign In
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