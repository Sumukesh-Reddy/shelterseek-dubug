import React, { useMemo, useState } from 'react';
import AdminNavbar from '../../components/AdminNavbar/navbar';
import './AdminManagerRegister.css';
import { API_ENDPOINTS } from '../../config/api';

const digitsOnly = (value, maxLength) => {
  return String(value || '').replace(/\D/g, '').slice(0, maxLength);
};

const buildUsernameBase = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.+|\.+$/g, '');
};

const AdminManagerRegister = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [department, setDepartment] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const username = useMemo(() => buildUsernameBase(fullName), [fullName]);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setDob('');
    setGender('');
    setAadhaar('');
    setPan('');
    setDepartment('');
    setJoiningDate('');
    setPassword('');
    setConfirmPassword('');
    setSendWelcomeEmail(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const normalizedPhone = digitsOnly(phone, 10);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    if (!username) {
      setError('Please enter a valid full name to generate a username.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Admin session not found. Please log in again.');
      return;
    }

    const payload = {
      name: fullName.trim(),
      email: email.trim(),
      phone: normalizedPhone,
      dob,
      gender,
      aadhaar: digitsOnly(aadhaar, 12),
      pan,
      role: 'Manager',
      department,
      joiningDate,
      username,
      password,
      sendWelcomeEmail
    };

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN.MANAGERS_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        setError(data?.message || 'Failed to create manager.');
        return;
      }

      const createdUsername = data?.manager?.username || username;
      const emailNote = data?.emailSent === false ? ' (welcome email not sent)' : '';

      setSuccess(`Manager created successfully. Username: ${createdUsername}${emailNote}.`);
      resetForm();
    } catch (err) {
      console.error('Manager registration failed:', err);
      setError('Failed to create manager. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-manager-page">
      <div className="admin-manager-navbar">
        <AdminNavbar />
      </div>

      <div className="admin-manager-header">
        <div className="admin-manager-title-row">
          <h2 className="admin-manager-title">Register Manager</h2>
          <span className="admin-manager-title-accent" />
        </div>
        <p className="admin-manager-subtitle">
          Create a manager profile and send an optional welcome email.
        </p>
      </div>

      <div className="admin-manager-card">
        {error && <div className="admin-manager-message error">{error}</div>}
        {success && <div className="admin-manager-message success">{success}</div>}

        <form className="admin-manager-form" onSubmit={handleSubmit}>
          <div className="admin-manager-section">
            <h3>Personal Information</h3>
            <div className="admin-manager-grid">
              <label className="admin-manager-field">
                <span>Full Name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </label>

              <label className="admin-manager-field">
                <span>Email Address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@example.com"
                  required
                />
              </label>

              <label className="admin-manager-field">
                <span>Phone Number</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(digitsOnly(e.target.value, 10))}
                  placeholder="Enter 10 digit number"
                  maxLength={10}
                  autoComplete="off"
                  required
                />
              </label>

              <label className="admin-manager-field">
                <span>Date of Birth</span>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </label>

              <label className="admin-manager-field">
                <span>Gender</span>
                <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
          </div>

          <div className="admin-manager-section">
            <h3>Identity Verification</h3>
            <div className="admin-manager-grid">
              <label className="admin-manager-field">
                <span>Aadhaar Card Number</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(digitsOnly(e.target.value, 12))}
                  placeholder="12 digit number"
                  maxLength={12}
                  autoComplete="off"
                  required
                />
              </label>

              <label className="admin-manager-field">
                <span>PAN Card Number</span>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]"
                  required
                />
              </label>
            </div>
          </div>

          <div className="admin-manager-section">
            <h3>Role & Department</h3>
            <div className="admin-manager-grid">
              <label className="admin-manager-field">
                <span>Role</span>
                <input type="text" value="Manager" readOnly />
              </label>

              <label className="admin-manager-field">
                <span>Department</span>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
                  <option value="">Select department</option>
                  <option value="Bookings">Bookings</option>
                  <option value="Listings">Listings</option>
                  <option value="Support">Support</option>
                  <option value="Finance">Finance</option>
                </select>
              </label>

              <label className="admin-manager-field">
                <span>Joining Date</span>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  required
                />
              </label>
            </div>
          </div>

          <div className="admin-manager-section">
            <h3>Account Credentials</h3>
            <div className="admin-manager-grid">
              <label className="admin-manager-field">
                <span>Username (Auto-generated)</span>
                <input type="text" value={username} readOnly />
              </label>

              <label className="admin-manager-field">
                <span>Password</span>
                <div className="admin-manager-input-action">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="admin-manager-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <label className="admin-manager-field">
                <span>Confirm Password</span>
                <div className="admin-manager-input-action">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="admin-manager-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
            </div>
          </div>

          <div className="admin-manager-section">
            <h3>Account Settings</h3>
            <label className="admin-manager-checkbox">
              <input
                type="checkbox"
                checked={sendWelcomeEmail}
                onChange={(e) => setSendWelcomeEmail(e.target.checked)}
              />
              <span>Send Welcome Email</span>
            </label>
          </div>

          <div className="admin-manager-actions">
            <button type="submit" className="admin-manager-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Manager'}
            </button>
            <button
              type="button"
              className="admin-manager-secondary"
              onClick={() => {
                resetForm();
                setError('');
                setSuccess('');
              }}
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminManagerRegister;