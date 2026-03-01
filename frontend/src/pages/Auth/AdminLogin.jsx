// AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Static admin credentials check
      if (email === 'shelterseekrooms@gmail.com' && password === 'admin123') {
        // Create admin user object
        const adminUser = {
          id: 'admin-001',
          name: 'ShelterSeek Admin',
          email: 'shelterseekrooms@gmail.com',
          accountType: 'admin',
          role: 'administrator'
        };

        // Store in localStorage
        const token = 'admin-token-' + Date.now();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        
        // Also store in sessionStorage for consistency
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(adminUser));
        sessionStorage.setItem('currentUser', JSON.stringify(adminUser));
        
        console.log('Admin login successful:', adminUser);
        console.log('Token stored:', token);
        
        // Force a small delay and then redirect
        setTimeout(() => {
          navigate('/admindashboard');
          // Force page reload to ensure auth is recognized
          window.location.reload();
        }, 100);
      } else {
        throw new Error('Invalid admin credentials');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">ShelterSeek</div>
          <p className="auth-subtitle">
            Admin Portal - Secure Access
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Admin Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="shelterseekrooms@gmail.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Admin Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span> Signing in...
              </>
            ) : (
              'Login as Admin'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/" className="auth-link">← Back to User Login</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;