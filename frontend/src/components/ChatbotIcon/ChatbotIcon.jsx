// components/ChatbotIcon/ChatbotIcon.jsx
import React, { useState } from 'react';
import HotelChatbot from '../../pages/HotelChatBot/HotelChatbot';
import './ChatbotIcon.css';

const ChatbotIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating AI Chatbot Icon */}
      <div 
        className="chatbot-icon-container"
        onClick={toggleChatbot}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`chatbot-icon ${isHovered ? 'chatbot-icon-hover' : ''}`}>
          {/* AI Bot Head */}
          <div className="chatbot-head">
            {/* Bot "face" */}
            <div className="modal-bot-face">
              <div> 
                <div className="modal-bot-eye"></div>
                <div className="modal-bot-eye"></div>
              </div>
              <div className="modal-bot-mouth"></div>
            </div>
                        
            {/* AI Circuit Lines */}
            <div className="circuit-line line-1"></div>
            <div className="circuit-line line-2"></div>
            <div className="circuit-line line-3"></div>
            
            {/* Pulsing Glow Effect */}
            <div className="ai-glow"></div>
          </div>
        </div>
        
        <div className="chatbot-tooltip">Ask ShelterSeek Assistant</div>
        
        {/* Optional: Small notification badge */}
        <div className="ai-notification">
          <div className="ai-pulse"></div>
        </div>
      </div>

      {/* Chatbot Modal Overlay */}
      {isOpen && (
        <div className="chatbot-modal-overlay" onClick={toggleChatbot}>
          <div className="chatbot-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="chatbot-modal-header">
              <div className="chatbot-modal-title">
                <div>
                  <div className="chatbot-modal-title-main">
                    <span className="ai-badge">AI</span> ShelterSeek chatbot — Hotel Booking Assistant
                  </div>
                  <div className="chatbot-modal-title-sub">Powered by artificial intelligence • 24/7 support</div>
                </div>
              </div>
              <button className="chatbot-modal-close" onClick={toggleChatbot}>✕</button>
            </div>
            <div className="chatbot-modal-body">
              <HotelChatbot />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotIcon;