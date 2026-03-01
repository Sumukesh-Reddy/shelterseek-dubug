import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { getManagerHomePath } from '../../utils/managerRouting';
import './ManagerProfile.css';

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const maskAadhaar = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length !== 12) {
    return 'N/A';
  }

  return `XXXX XXXX ${digits.slice(-4)}`;
};

const maskPan = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized.length !== 10) {
    return 'N/A';
  }

  return `${normalized.slice(0, 5)}****${normalized.slice(-1)}`;
};

const ManagerProfile = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const authToken = token || localStorage.getItem('token') || '';

  useEffect(() => {
    const fetchManagerProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(API_ENDPOINTS.MANAGERS.PROFILE, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || 'Failed to load manager profile');
        }

        setManager(data.manager || null);
      } catch (fetchError) {
        console.error('Failed to load manager profile:', fetchError);
        setError(fetchError.message || 'Failed to load manager profile');
      } finally {
        setLoading(false);
      }
    };

    fetchManagerProfile();
  }, [authToken]);

  const profileGroups = useMemo(() => {
    const profile = manager || user || {};

    return [
      {
        title: 'Personal Information',
        items: [
          { label: 'Full Name', value: profile.name || 'N/A' },
          { label: 'Email Address', value: profile.email || 'N/A' },
          { label: 'Phone Number', value: profile.phone || 'N/A' },
          { label: 'Date of Birth', value: formatDate(profile.dob) },
          { label: 'Gender', value: profile.gender || 'N/A' }
        ]
      },
      {
        title: 'Role & Department',
        items: [
          { label: 'Role', value: profile.role || 'Manager' },
          { label: 'Department', value: profile.department || 'N/A' },
          { label: 'Username', value: profile.username || 'N/A' },
          { label: 'Joining Date', value: formatDate(profile.joiningDate) },
          { label: 'Account Created', value: formatDate(profile.createdAt) }
        ]
      },
      {
        title: 'Identity Verification',
        items: [
          { label: 'Aadhaar Card Number', value: maskAadhaar(profile.aadhaar) },
          { label: 'PAN Card Number', value: maskPan(profile.pan) }
        ]
      }
    ];
  }, [manager, user]);

  const handlePasswordFieldChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Fill in all password fields');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(API_ENDPOINTS.MANAGERS.CHANGE_PASSWORD, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(passwordForm)
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to change password');
      }

      setSuccessMessage(data?.message || 'Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (changeError) {
      console.error('Failed to change manager password:', changeError);
      setError(changeError.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const workspacePath = getManagerHomePath(manager?.department || user?.department);

  return (
    <div className="manager-profile-page">
      <header className="manager-profile-hero">
        <div>
          <p className="manager-profile-kicker">Manager Account</p>
          <h1>Profile & Security</h1>
          <p className="manager-profile-subtitle">
            Review account details and update your manager password from one place.
          </p>
        </div>

        <div className="manager-profile-hero-panel">
          <div>
            <span className="manager-profile-panel-label">Signed in as</span>
            <strong>{manager?.name || user?.name || 'Manager'}</strong>
            <span className="manager-profile-department-tag">
              {manager?.department || user?.department || 'Manager'}
            </span>
          </div>
          <div className="manager-profile-hero-actions">
            <button type="button" className="ghost" onClick={() => navigate(workspacePath)}>
              Workspace
            </button>
            <button type="button" className="solid" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {(error || successMessage) && (
        <div className={`manager-profile-banner ${error ? 'error' : 'success'}`}>
          {error || successMessage}
        </div>
      )}

      {loading ? (
        <div className="manager-profile-loading-card">Loading manager profile...</div>
      ) : (
        <div className="manager-profile-grid">
          <section className="manager-profile-main">
            {profileGroups.map((group) => (
              <article key={group.title} className="manager-profile-card">
                <div className="manager-profile-card-header">
                  <h2>{group.title}</h2>
                </div>
                <div className="manager-profile-facts-grid">
                  {group.items.map((item) => (
                    <div key={item.label} className="manager-profile-fact">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <aside className="manager-profile-side">
            <section className="manager-profile-card">
              <div className="manager-profile-card-header">
                <h2>Change Password</h2>
                <button
                  type="button"
                  className="manager-password-toggle"
                  onClick={() => setShowPasswords((currentValue) => !currentValue)}
                >
                  {showPasswords ? 'Hide' : 'Show'}
                </button>
              </div>

              <form className="manager-password-form" onSubmit={handlePasswordChange}>
                <label>
                  <span>Current Password</span>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordFieldChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </label>

                <label>
                  <span>New Password</span>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFieldChange}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />
                </label>

                <label>
                  <span>Confirm New Password</span>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFieldChange}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </label>

                <button type="submit" className="manager-password-submit" disabled={changingPassword}>
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </section>

            <section className="manager-profile-card manager-profile-note-card">
              <div className="manager-profile-card-header">
                <h2>Account Notes</h2>
              </div>
              <ul className="manager-profile-note-list">
                <li>Department and role are controlled from the admin side.</li>
                <li>Use a password that is different from your email and old password.</li>
                <li>After changing the password, your current session stays active.</li>
              </ul>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
};

export default ManagerProfile;
