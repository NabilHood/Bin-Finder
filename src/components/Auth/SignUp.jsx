import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const SignUp = ({ setUser }) => {
  const [formData, setFormData] = useState({
    firstnam: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = 'https://rv-n5oa.onrender.com';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstnam.trim()) {
      newErrors.firstnam = 'First name is required';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        const signupData = {
          firstnam: formData.firstnam,
          lastname: formData.lastname,
          username: formData.username,
          email: formData.email,
          password: formData.password
        };

        console.log('Sending signup request to:', `${BASE_URL}/vr/user/signup`);
        console.log('Signup data:', signupData);

        const response = await fetch(`${BASE_URL}/vr/user/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(signupData)
        });

        //Check the response status and content type
        const contentType = response.headers.get('content-type');
        console.log('Response status:', response.status);
        console.log('Content type:', contentType);

        if (!contentType || !contentType.includes('application/json')) {
          // If it's not JSON, read as text to see what we got
          const textResponse = await response.text();
          console.error('Non-JSON response received:', textResponse.substring(0, 500));
          
          if (response.status === 500) {
            throw new Error('Server error. Please try again later.');
          } else if (response.status === 0) {
            throw new Error('Network error or CORS issue. Please check your connection.');
          } else {
            throw new Error(`Server returned an error (Status: ${response.status}). Please try again.`);
          }
        }

        const data = await response.json();
        console.log('Signup response data:', data);

        if (!response.ok) {
          throw new Error(data.message || `Signup failed with status: ${response.status}`);
        }

        // Signup successful, redirect to login
        navigate('/login', { 
          state: { message: 'Account created successfully! Please login.' }
        });
        
      } catch (error) {
        console.error('Signup error:', error);
        setErrors({ 
          submit: error.message || 'Sign up failed. Please try again.' 
        });
      } finally {
        setIsLoading(false);
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
          <h1>Join BinFinder</h1>
          <p>Start your recycling journey in Cyberjaya</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstnam">First Name</label>
            <input
              type="text"
              id="firstnam"
              name="firstnam"
              value={formData.firstnam}
              onChange={handleChange}
              className={errors.firstnam ? 'error' : ''}
              placeholder="Enter your first name"
            />
            {errors.firstnam && <span className="error-text">{errors.firstnam}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastname">Last Name</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className={errors.lastname ? 'error' : ''}
              placeholder="Enter your last name"
            />
            {errors.lastname && <span className="error-text">{errors.lastname}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="Choose a username"
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

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
              placeholder="Create a password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          {errors.submit && <div className="error-text submit-error">{errors.submit}</div>}

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        <div className="benefits-section">
          <h3>Start earning rewards for recycling!</h3>
          <ul>
            <li>📍 Find recycling locations in Cyberjaya</li>
            <li>🏆 Earn points for recycling activities</li>
            <li>📱 Track your recycling history</li>
            <li>👥 Join the eco-friendly community</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignUp;