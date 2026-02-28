// Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ searchKeywords, onSearchChange }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginSelection, setShowLoginSelection] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Check login status
  useEffect(() => {
    const userData = sessionStorage.getItem('currentUser'); 
    if (userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMobileMenuOpen(false);
    setShowLoginSelection(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsUserMenuOpen(false);
    setShowLoginSelection(false);
  };

  const toggleLoginSelection = () => {
    setShowLoginSelection(!showLoginSelection);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeAllMenus = () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    setShowLoginSelection(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');   // FIXED 🔥
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setIsLoggedIn(false);
    setUser(null);
    closeAllMenus();
    window.location.href = '/';
  };

  return (
    <div className="traveler_navbar">
      <div id="traveler_logo">
        <Link to="/" style={{ textDecoration: 'none' }} onClick={closeAllMenus}>
          <div>
            <span id="logo-s">S</span>
            <span id="logo-r">helter</span>
            <span id="logo-s">S</span>
            <span id="logo-r">eek</span>
          </div>
        </Link>
      </div>

      <div id="traveler_searchbar">
        <input
          type="text"
          id="search-bar"
          name="destination"
          placeholder="Where to go!"
          value={searchKeywords}
          onChange={onSearchChange}
        />
        <button>
          <i className="fa fa-search" id="search-button"></i>
        </button>
      </div>

      <div className="cart">
        <Link to="/wishlist" onClick={closeAllMenus}>
          <i className="fa fa-heart"></i>
        </Link>
      </div>

      <div className="about">
        <Link to="/about" onClick={closeAllMenus}>About</Link>
      </div>

      <div className="inbox">
        <Link to="/chat" onClick={closeAllMenus}>
          <i className="fa fa-envelope" id="i-inbox"></i>
        </Link>
      </div>

      {/* Logged-in */}
      {isLoggedIn ? (
        <div className="user-area">
          <div className="user-welcome">
            <span style={{ display: 'none' }}>
              {user?.name || 'User'}
            </span>
          </div>

          <div className="traveler" style={{ position: 'relative' }}>
            <button 
              id="user-button" 
              onClick={toggleUserMenu}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <i className="fa fa-user" style={{fontSize:'1.7rem'}}></i>
            </button>

            {isUserMenuOpen && (
              <div className="user-menu">
                <button className="user-close-btn" onClick={toggleUserMenu}>×</button>
                <ul>
                  <li><Link to="/traveler/profile" onClick={closeAllMenus}>Profile</Link></li>
                  <li><Link to="/history" onClick={closeAllMenus}>Viewed History</Link></li>
                  <li><Link to="/BookedHistory" onClick={closeAllMenus}>Booked History</Link></li>
                  <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Logged-out menu (pages allowed!) */
        <>
          <div className="traveler" style={{ position: 'relative' }}>
            <button 
              id="user-button" 
              onClick={toggleUserMenu}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <i className="fa fa-user" style={{fontSize:'1.7rem'}}></i>
            </button>

            {isUserMenuOpen && (
              <div className="user-menu">
                <button className="user-close-btn" onClick={toggleUserMenu}>×</button>
                <ul>
                  <li><Link to="/traveler/profile" onClick={closeAllMenus}>Profile</Link></li>
                  <li><Link to="/history" onClick={closeAllMenus}>Viewed History</Link></li>
                  <li><Link to="/BookedHistory" onClick={closeAllMenus}>Booked History</Link></li>

                  <li>
                    <button onClick={toggleLoginSelection} className="menu-login-option">
                      Login / Sign Up
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {/* Menubar */}
      <div className="menubar">
        <button 
          id="menubutton" 
          onClick={toggleMobileMenu}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <i className="fa fa-bars"></i>
        </button>
      </div>

      {/* Login Selection Modal */}
      {showLoginSelection && (
        <div className="login-selection-modal">
          <div className="login-selection-overlay" onClick={closeAllMenus}></div>
          <div className="login-selection-card">
            <button className="login-close-btn" onClick={closeAllMenus}>×</button>

            <div className="login-selection-header">
              <div className="login-selection-logo">
                <span id="logo-s">S</span>
                <span id="logo-r">helter</span>
                <span id="logo-s">S</span>
                <span id="logo-r">eek</span>
              </div>
              <p className="login-selection-subtitle">
                Choose how you'd like to access your account
              </p>
            </div>

            <div className="login-selection-options">
              <Link to="/traveler-login" className="login-option" onClick={closeAllMenus}>
                <div className="option-icon">🧳</div>
                <div className="option-content">
                  <h3>Traveler Login</h3>
                  <p>Sign in to explore stays</p>
                </div>
                <div className="option-arrow">→</div>
              </Link>

              <Link to="/host-login" className="login-option" onClick={closeAllMenus}>
                <div className="option-icon">🏠</div>
                <div className="option-content">
                  <h3>Host Login</h3>
                  <p>Manage your properties</p>
                </div>
                <div className="option-arrow">→</div>
              </Link>

              <Link to="/manager-login" className="login-option">
                <div className="option-icon">👨‍💼</div>
                <div className="option-content">
                  <h3>Manager Login</h3>
                  <p>Oversee operations</p>
                </div>
                <div className="option-arrow">→</div>
              </Link>
              
              <Link to="/admin-login" className="login-option" onClick={closeAllMenus}>
                <div className="option-icon">⚙️</div>
                <div className="option-content">
                  <h3>Admin Login</h3>
                  <p>System management</p>
                </div>
                <div className="option-arrow">→</div>
              </Link>

              
            </div>

            <div className="login-selection-footer">
              <p>
                Don't have an account? 
                <Link to="/signup" className="auth-link" onClick={closeAllMenus}> Sign up here</Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <button className="close-btn" onClick={toggleMobileMenu}>×</button>
          <ul>
            <li><Link to="/traveler/profile" onClick={closeAllMenus}>Profile</Link></li>
            <li><Link to="/chat" onClick={closeAllMenus}>Inbox</Link></li>
            <li><Link to="/history" onClick={closeAllMenus}>Viewed History</Link></li>
            <li><Link to="/BookedHistory" onClick={closeAllMenus}>Booked History</Link></li>
            <li><Link to="/wishlist" onClick={closeAllMenus}>Wishlist</Link></li>
            <li><Link to="/about" onClick={closeAllMenus}>About</Link></li>

            {isLoggedIn ? (
              <li><button onClick={handleLogout} className="mobile-logout-button">Logout</button></li>
            ) : (
              <li><button onClick={toggleLoginSelection} className="mobile-login-option">Login / Sign Up</button></li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
