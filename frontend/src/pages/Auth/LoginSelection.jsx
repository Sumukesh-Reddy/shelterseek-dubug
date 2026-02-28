// LoginSelection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './LoginSelection.css';

const LoginSelection = () => {
  return (
    <div className="selection-container">
      <div className="selection-card">
        <div className="selection-header">
          <div className="selection-logo">ShelterSeek</div>
          <p className="selection-subtitle">
            Welcome to ShelterSeek! Choose how you'd like to access your account
          </p>
        </div>

        <div className="selection-options">
          <Link to="/traveler-login" className="selection-option traveler-option">
            <div className="option-icon">🧳</div>
            <div className="option-content">
              <h3 className="option-title">Traveler Login</h3>
              <p className="option-description">
                Sign in to explore amazing accommodations, book stays, and manage your travel plans
              </p>
            </div>
            <div className="option-arrow">→</div>
          </Link>

          <Link to="/host-login" className="selection-option host-option">
            <div className="option-icon">🏠</div>
            <div className="option-content">
              <h3 className="option-title">Host Login</h3>
              <p className="option-description">
                Access your host dashboard to manage properties, bookings, and guest communications
              </p>
            </div>
            <div className="option-arrow">→</div>
          </Link>
          <Link to="/manager-login" className="selection-option manager-option">
            <div className="option-icon">⚙️</div>
            <div className="option-content">
              <h3 className="option-title">Manager Login</h3>
              <p className="option-description">
                Access manager dashboard to oversee operations, manage bookings, and monitor performance
              </p>
            </div>
            <div className="option-arrow">→</div>
          </Link>
          <Link to="/admin-login" className="selection-option admin-option">
            <div className="option-icon">⚙️</div>
            <div className="option-content">
              <h3 className="option-title">Admin Login</h3>
              <p className="option-description">
                Access administrative controls and system management
              </p>
            </div>
            <div className="option-arrow">→</div>
          </Link>
        </div>

        <div className="selection-footer">
          <p className="selection-help-text">
            Don't have an account? <Link to="/signup" className="auth-link">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
