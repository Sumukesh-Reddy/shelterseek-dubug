// components/Chat/UserList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserList.css';

const UserList = ({ onSelectUser, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3001/api/chat/users/search`, {
          params: { query: searchQuery },
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data.users || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="user-list-modal" onClick={onClose}>
      <div className="user-list-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">Start New Chat</h3>
          <button 
            onClick={onClose}
            className="close-button"
          >
            ×
          </button>
        </div>
        
        {/* Search */}
        <div className="search-section">
          <div className="modal-search-container">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="modal-search-input"
            />
            
          </div>
          <div className="search-hint">
            Type at least 2 characters to search
          </div>
        </div>
        
        {/* User List */}
        <div className="users-list">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <div className="loading-text">Searching users...</div>
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                onClick={() => onSelectUser(user._id)}
                className="user-item"
              >
                <img
                  src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}&background=7289da&color=fff`}
                  alt={user.name}
                  className="user-list-avatar"
                />
                <div className="user-list-info">
                  <div className="user-list-name">
                    {user.name || 'Unknown User'}
                  </div>
                  <div className="user-list-email">
                    {user.email || ''}
                  </div>
                  <div className="user-status-indicator">
                    <span className={`status-dot ${user.online ? 'online' : 'offline'}`} />
                    <span className={`status-text ${user.online ? 'online' : 'offline'}`}>
                      {user.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <div className="empty-state-title">
                {searchQuery.trim().length >= 2 
                  ? 'No users found'
                  : 'Search for users to start a chat'
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;