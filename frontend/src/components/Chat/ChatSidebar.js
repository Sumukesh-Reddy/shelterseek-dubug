// components/Chat/ChatSidebar.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ChatSidebar.css';

const ChatSidebar = ({ 
  rooms, 
  selectedRoom, 
  onSelectRoom, 
  onStartNewChat, 
  onlineUsers 
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms.filter(room => {
    if (!searchQuery) return true;
    
    const otherParticipant = room.participants?.find(p => p._id !== user?._id) || room.participants?.[0];
    const searchLower = searchQuery.toLowerCase();
    
    return (
      otherParticipant?.name?.toLowerCase().includes(searchLower) ||
      otherParticipant?.email?.toLowerCase().includes(searchLower) ||
      room.lastMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search chats...🔍"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button 
          onClick={onStartNewChat}
          className="new-chat-button"
        >
          + New Chat
        </button>
      </div>
      
      <div className="rooms-list">
        {filteredRooms.map(room => {
          const otherParticipant = room.participants?.find(p => 
            p._id !== user?._id && p._id !== user?.id
          );
          
          const displayParticipant = otherParticipant || room.participants?.[0];
          const isOnline = onlineUsers.has(displayParticipant?._id);
          
          return (
            <div
              key={room._id}
              onClick={() => onSelectRoom(room)}
              className={`room-item ${selectedRoom?._id === room._id ? 'selected' : ''}`}
            >
              <div className="avatar-container">
                <img
                  src={displayParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${displayParticipant?.name}&background=7289da&color=fff`}
                  alt={displayParticipant?.name}
                  className="user-avatar"
                />
                {isOnline && <div className="online-indicator" />}
              </div>
              
              <div className="room-info">
                <div className="user-info-row">
                  <div className="user-name">
                    {displayParticipant?.name || 'Unknown User'}
                  </div>
                  {isOnline && <div className="online-dot" />}
                </div>
                <div className="last-message">
                  {room.lastMessage?.content || 'No messages yet'}
                </div>
              </div>
              
              <div className="room-meta">
                <div className="message-time">
                  {room.lastMessage?.createdAt 
                    ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })
                    : ''
                  }
                </div>
                
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatSidebar;