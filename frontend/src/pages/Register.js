import React, { useState } from 'react';
import axios from '../utils/axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    if (error) setError('');
    
    if (e.target.name === 'password') {
      checkPasswordStrength(e.target.value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength('');
    } else if (password.length < 6) {
      setPasswordStrength('weak');
    } else if (password.length < 10) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const parseMongoError = (errorMessage) => {
    // Handle MongoDB E11000 duplicate key errors
    if (errorMessage.includes('E11000') && errorMessage.includes('duplicate key')) {
      if (errorMessage.includes('username_1') || errorMessage.includes('username:')) {
        return 'This username is already taken. Please choose a different one.';
      } else if (errorMessage.includes('email_1') || errorMessage.includes('email:')) {
        return 'An account with this email already exists. Try logging in instead.';
      } else {
        return 'This username or email is already taken. Please choose different ones.';
      }
    }
    return null; // Not a duplicate key error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic client-side validation
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    
    try {
      const res = await axios.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        // First, check if there's a MongoDB duplicate key error in the error field
        if (data && data.error) {
          const mongoError = parseMongoError(data.error);
          if (mongoError) {
            errorMessage = mongoError;
          } else if (data.error.includes('validation')) {
            errorMessage = 'Please fill in all fields correctly.';
          } else {
            // Use the error field for other specific errors
            errorMessage = data.error;
          }
        }
        // Then check the msg field
        else if (data && data.msg && data.msg !== 'Server error') {
          const mongoError = parseMongoError(data.msg);
          if (mongoError) {
            errorMessage = mongoError;
          } else if (data.msg.toLowerCase().includes('already exists') || 
                     data.msg.toLowerCase().includes('duplicate')) {
            if (data.msg.toLowerCase().includes('username')) {
              errorMessage = 'This username is already taken. Please choose a different one.';
            } else if (data.msg.toLowerCase().includes('email')) {
              errorMessage = 'An account with this email already exists. Try logging in instead.';
            } else {
              errorMessage = 'This username or email is already taken. Please try different ones.';
            }
          } else if (data.msg.toLowerCase().includes('validation')) {
            errorMessage = 'Please fill in all fields correctly.';
          } else {
            errorMessage = data.msg;
          }
        }
        // Handle by status code if no useful message
        else {
          if (status === 400) {
            errorMessage = 'Invalid registration data. Please check your information.';
          } else if (status === 409) {
            errorMessage = 'Username or email already exists. Please try different ones.';
          } else if (status === 500) {
            errorMessage = 'Server error. Please try again later or contact support.';
          } else {
            errorMessage = `Registration failed (Error ${status}). Please try again.`;
          }
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check your internet connection and make sure the backend is running.';
      } else {
        errorMessage = 'Request failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'strong': return '#28a745';
      default: return '#dee2e6';
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header Section */}
        <div className="register-header">
          <div className="register-logo">
            🌟
          </div>
          <h2 className="register-title">Join Our Community</h2>
          <p className="register-subtitle">Start sharing your amazing travel experiences</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
                minLength="3"
                maxLength="20"
              />
            </div>
            <div className="input-hint">
              3-20 characters, letters and numbers only
            </div>
          </div>

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
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
              />
            </div>
            <div className="input-hint">
              We'll use this for login and important updates
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                className="form-input password-input"
                required
                disabled={loading}
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill"
                    style={{ 
                      width: passwordStrength === 'weak' ? '33%' : 
                             passwordStrength === 'medium' ? '66%' : 
                             passwordStrength === 'strong' ? '100%' : '0%',
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  ></div>
                </div>
                <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                  {passwordStrength === 'weak' && '🔴 Weak - Add more characters'}
                  {passwordStrength === 'medium' && '🟡 Good - Almost there!'}
                  {passwordStrength === 'strong' && '🟢 Strong - Perfect!'}
                </span>
              </div>
            )}
            <div className="input-hint">
              At least 6 characters for security
            </div>
          </div>

          <button 
            type="submit" 
            className={`register-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Account...
              </>
            ) : (
              <>
                <span className="button-icon">🚀</span>
                Create My Account
              </>
            )}
          </button>
        </form>

        {/* Footer Section */}
        <div className="register-footer">
          <p className="login-prompt">
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign in here
            </Link>
          </p>
          
          <div className="divider">
            <span>or</span>
          </div>
          
          <Link to="/all-logs" className="browse-link">
            🌍 Explore Travel Logs First
          </Link>
          
          <div className="terms-text">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
      
      {/* Background Elements */}
      <div className="background-elements">
        <div className="floating-element element-1">🎒</div>
        <div className="floating-element element-2">📸</div>
        <div className="floating-element element-3">🗺️</div>
        <div className="floating-element element-4">🌟</div>
        <div className="floating-element element-5">✈️</div>
        <div className="floating-element element-6">🏖️</div>
      </div>
    </div>
  );
}

export default Register;