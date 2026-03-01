// components/Chat/ChatWindow.js
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ChatWindow.css';

const ChatWindow = ({ 
  room, 
  messages, 
  onSendMessage, 
  onDeleteRoom, 
  onBack, 
  isMobile 
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const otherParticipant = room.participants?.find(p => 
    p._id !== user?._id && p._id !== user?.id
  ) || room.participants?.[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          {isMobile && onBack && (
            <button 
              onClick={onBack}
              className="back-button"
            >
              ←
            </button>
          )}
          <div className="chat-user-avatar">
            <img
              src={otherParticipant?.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant?.name}&background=7289da&color=fff`}
              alt={otherParticipant?.name}
              className="header-avatar"
            />
          </div>
          <div className="user-details">
            <div className="user-name">
              {otherParticipant?.name || 'Unknown User'}
            </div>
            <div className="user-status">
              {otherParticipant?.online ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
        
        <button 
          onClick={onDeleteRoom}
          className="delete-chat-button"
        >
          Delete chat
        </button>
      </div>
      
      {/* Messages */}
      <div className="messages-container">
        {messages.map(msg => {
          const isOwnMessage = msg.sender?._id === user?._id;
          
          return (
            <div 
              key={msg._id} 
              className={`message-wrapper ${isOwnMessage ? 'own-message' : 'other-message'}`}
            >
              {!isOwnMessage && (
                <img
                  src={msg.sender?.profilePhoto || `https://ui-avatars.com/api/?name=${msg.sender?.name}&background=7289da&color=fff`}
                  alt={msg.sender?.name}
                  className="message-avatar"
                />
              )}
              
              <div className="message-content-wrapper">
                {!isOwnMessage && (
                  <div className="message-sender">
                    {msg.sender?.name}
                  </div>
                )}
                <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
                  {msg.type === 'image' && msg.mediaUrl ? (
                    <img 
                      src={msg.mediaUrl} 
                      alt="attachment" 
                      className="message-image"
                    />
                  ) : (
                    <span className="message-text">{msg.content}</span>
                  )}
                </div>
                <div className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="messages-end" />
      </div>
      
      {/* Input */}
      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="message-form">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="message-input"
            rows="1"
          />
          <button 
            type="submit" 
            disabled={!message.trim()}
            className="send-button"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;