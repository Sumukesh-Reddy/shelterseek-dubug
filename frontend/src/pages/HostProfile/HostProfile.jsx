import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HostProfile.css';

const HostProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [alert, setAlert] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const currentUser = JSON.parse(
      localStorage.getItem('user') || 
      sessionStorage.getItem('currentUser') || 
      'null'
    );
    
    if (!currentUser) {
      alert('Please log in to view your profile.');
      navigate('/loginweb');
      return;
    }

    fetchUserData(currentUser);
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserData = async (currentUser) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/users?email=${encodeURIComponent(currentUser.email)}&accountType=${currentUser.accountType}`,
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        const userData = response.data.data.travelers?.[0] || response.data.data.hosts?.[0];
        if (userData) {
          const updatedUser = {
            ...currentUser,
            ...userData
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      const currentUser = JSON.parse(
        localStorage.getItem('user') || 
        sessionStorage.getItem('currentUser') || 
        'null'
      );
      if (currentUser) setUser(currentUser);
    }
  };

  const getProfilePhotoUrl = (profilePhoto) => {
    if (!profilePhoto) return '/images/photo1.jpg';
    if (profilePhoto.startsWith('http')) return profilePhoto;
    if (profilePhoto.startsWith('/')) return `${API_BASE_URL}${profilePhoto}`;
    // ObjectId OR filename — both served by /api/images/:id
    if (profilePhoto.length > 0) return `${API_BASE_URL}/api/images/${profilePhoto}`;
    return '/images/photo1.jpg';
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await axios.post(
        `${API_BASE_URL}/api/images`,
        formData,
        { withCredentials: true }
      );

      if (uploadResponse.data.status !== 'success') {
        throw new Error(uploadResponse.data.message || 'Failed to upload image');
      }

      const updateResponse = await axios.patch(
        `${API_BASE_URL}/api/update-profile-photo`,
        {
          email: user.email,
          accountType: user.accountType,
          profilePhoto: uploadResponse.data.data.id,
        },
        { withCredentials: true }
      );

      if (updateResponse.data.status === 'success') {
        const newProfilePhotoUrl = `${API_BASE_URL}/api/images/${uploadResponse.data.data.id}`; // eslint-disable-line no-unused-vars
        const updatedUser = { ...user, profilePhoto: uploadResponse.data.data.id };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        showAlert('Profile picture updated successfully!', 'success');
      } else {
        throw new Error(updateResponse.data.message || 'Failed to update profile photo');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      showAlert(error.message || 'Failed to update profile picture', 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      showAlert("New passwords don't match!", 'error');
      return;
    }

    if (formData.newPassword.length < 8) {
      showAlert('Password must be at least 8 characters long!', 'error');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/change-password`,
        {
          email: user.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          accountType: user.accountType
        },
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        showAlert('Password changed successfully!', 'success');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showAlert(error.response?.data?.message || 'Failed to change password. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleActivity = () => {
    if (user?.accountType === 'host') {
      navigate('/dashboard');
    } else if (user?.accountType === 'traveller') {
      navigate('/history');
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="header-bg"></div>
      <div className="profile-container">
        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="profile-left">
          <img // eslint-disable-line jsx-a11y/img-redundant-alt
            src={getProfilePhotoUrl(user.profilePhoto)}
            alt="Profile Picture"
            className="profile-pic"
            onError={(e) => {
              e.target.src = '/images/photo1.jpg';
            }}
          />
          <br />
          <label htmlFor="profile-pic-input" className="upload-btn">
            Change Picture
          </label>
          <input
            id="profile-pic-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleProfilePicChange}
          />
        </div>

        <div className="details-box">
          <h2>Hi!&nbsp;&nbsp;{user.name}</h2>
          <p><strong>Email:</strong> <span>{user.email}</span></p>
          <p><strong>User Type:</strong> <span>{user.accountType}</span></p>

          <div className="divider"></div>

          <div className="password-change-section">
            <h3>Change Password</h3>
            <form id="change-password-form" onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label htmlFor="current-password">Current Password</label>
                <input
                  type="password"
                  id="current-password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Change Password
              </button>
            </form>
          </div>

          <div className="more-functions">
            <button onClick={handleLogout}>Logout</button>
            <button onClick={handleActivity}>View Activity</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HostProfile;

