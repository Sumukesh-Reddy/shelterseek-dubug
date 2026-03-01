// ManagerLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/userSlice";
import './Login.css';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { getManagerHomePath } from '../../utils/managerRouting';

const ManagerLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setAuthenticatedSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginRes = await fetch(API_ENDPOINTS.MANAGERS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const loginData = await loginRes.json();
      
      if (!loginRes.ok || !loginData.success) {
        throw new Error(loginData.message || 'Login failed');
      }
      
      // Check if user is a manager
      if (loginData.user.accountType !== 'manager') {
        throw new Error('Invalid manager credentials');
      }
      
      setAuthenticatedSession(loginData.token, loginData.user);
      
      // Dispatch to Redux
      dispatch(setUser(loginData.user));
      
      // Store in sessionStorage for consistency
      sessionStorage.setItem('currentUser', JSON.stringify({
        ...loginData.user,
        email: loginData.user.email,
        accountType: loginData.user.accountType,
        name: loginData.user.name,
        department: loginData.user.department
      }));
      sessionStorage.setItem('token', loginData.token);
      
      navigate(getManagerHomePath(loginData.user.department), { replace: true });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container manager-login">
      <div className="auth-card manager-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">⚙️</span>
            ShelterSeek Manager
          </div>
          <p className="auth-subtitle">
            Access your manager dashboard to oversee operations
          </p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <span className="label-icon">📧</span>
              Manager Email
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your manager email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <span className="label-icon">🔒</span>
              Password
            </label>
            <div className="input-wrapper password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div className="form-hint">
              <Link to="/forgot-password" className="auth-link">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button type="submit" className="auth-button manager-button" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Logging in...
              </>
            ) : (
              <>
                <span className="button-icon">🔑</span>
                Login as Manager
              </>
            )}
          </button>

          <div className="auth-divider">
            <span>secure access</span>
          </div>

          <div className="manager-info">
            <p className="info-text">
              <span className="info-icon">ℹ️</span>
              Manager access is restricted to authorized personnel only
            </p>
          </div>
        </form>

        <div className="auth-footer">
          <div className="footer-links">
            <Link to="/" className="auth-link">
              <span className="link-icon">←</span>
              Back to Home
            </Link>
            <span className="separator">•</span>
            <Link to="/admin-login" className="auth-link">
              Admin Login
            </Link>
          </div>
          <p className="footer-note">
            Need help? Contact IT Support
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManagerLogin;
