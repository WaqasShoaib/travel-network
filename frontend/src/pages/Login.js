import React, { useState } from 'react';
import axios from '../utils/axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Import the separate CSS file

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header Section */}
        <div className="login-header">
          <div className="login-logo">
            🌍
          </div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to continue your travel journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Section */}
        <div className="login-footer">
          <p className="signup-prompt">
            Don't have an account?{' '}
            <Link to="/register" className="signup-link">
              Create one here
            </Link>
          </p>
          
          <div className="divider">
            <span>or</span>
          </div>
          
          <Link to="/all-logs" className="browse-link">
            🌍 Browse Travel Logs as Guest
          </Link>
        </div>
      </div>
      
      {/* Background Elements */}
      <div className="background-elements">
        <div className="floating-element element-1">✈️</div>
        <div className="floating-element element-2">🏔️</div>
        <div className="floating-element element-3">🏖️</div>
        <div className="floating-element element-4">🗽</div>
        <div className="floating-element element-5">🎒</div>
      </div>
    </div>
  );
}

export default Login;