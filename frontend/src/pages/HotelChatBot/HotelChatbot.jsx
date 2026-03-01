// client/src/components/HotelChatbot.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./HotelChatbot.css";

const api = {
  sendMessageToBot: async (message, history) => {
    const res = await fetch('http://localhost:3001/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => null);
      throw new Error(`AI server error: ${res.status} ${txt || ''}`);
    }
    return res.json();
  },
  bookRoom: async (hotelId, bookingDetails) => {
    const res = await fetch('http://localhost:3001/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotelId, bookingDetails }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => null);
      throw new Error(`Booking server error: ${res.status} ${txt || ''}`);
    }
    return res.json();
  },
};

function Message({ m }) {
  const navigate = useNavigate();
  if (m.type === "bot" && m.hotels) {
    return (
      <div className="hotel-chatbot__message-bot-with-hotels">
        <div className="hotel-chatbot__message-text bot-message">{m.text}</div>
        <div className="hotel-chatbot__hotels-list">
          {m.hotels.map((h) => (
            <div key={h.id} className="hotel-chatbot__hotel-card">
              
              <div className="hotel-chatbot__hotel-info">
                <div className="hotel-chatbot__hotel-name"><h2>{h.name}</h2></div>
                <div className="hotel-chatbot__hotel-location">{h.location}</div>
                <div className="hotel-chatbot__hotel-description">{h.description}</div>
              </div>
              <div className="hotel-chatbot__hotel-actions">
                <div className="hotel-chatbot__hotel-price">₹{h.price}/night</div>
                <button onClick={() =>  navigate(`/room/${h._id}`)}>Show Room🏡</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`hotel-chatbot__message ${m.type === "user" ? "user-message" : "bot-message"}`}>
      {m.text}
    </div>
  );
}

export default function HotelChatbot() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: "bot", 
      text: "Hi! I'm ShelterSeek bot — your hotel booking assistant. Where would you like to stay and when?", 
      suggestions: ["Search hotels in Goa", "Show budget hotels", "Beachfront properties", "Luxury resorts"]
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [bookingModal, setBookingModal] = useState(null);
  const containerRef = useRef();

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    function onClick(e) {
      const btn = e.target.closest(".book-btn");
      if (btn) {
        const hotelId = btn.getAttribute("data-hotelid");
        const lastBot = [...messages].reverse().find((m) => m.type === "bot" && m.hotels);
        const hotel = lastBot?.hotels?.find((h) => h.id === hotelId);
        if (hotel) openBookingModal(hotel);
      }
    }
    node.addEventListener("click", onClick);
    return () => node.removeEventListener("click", onClick);
  }, [messages]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  async function sendMessage(text) {
    if (!text?.trim()) return;
    const userMsg = { id: Date.now(), type: "user", text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);
    try {
      const res = await api.sendMessageToBot(text.trim(), messages.concat(userMsg));
      const botMsg = { 
        id: Date.now() + 1, 
        type: "bot", 
        text: res.reply || "", 
        suggestions: res.suggestions || [], 
        hotels: res.hotels || null 
      };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      setMessages((m) => [...m, { 
        id: Date.now(), 
        type: "bot", 
        text: "Sorry — an error occurred while contacting the assistant." 
      }]);
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  }

  function onSuggestionClick(s) { 
    sendMessage(s); 
  }

  function openBookingModal(hotel) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    setBookingModal({ 
      hotel, 
      details: { 
        name: "", 
        nights: 3, 
        guests: 2, 
        checkin: tomorrow.toISOString().split('T')[0], 
        checkout: nextWeek.toISOString().split('T')[0] 
      } 
    });
  }

  async function confirmBooking(details) {
    setBookingModal(null);
    setMessages((m) => [...m, { 
      id: Date.now(), 
      type: "user", 
      text: `Book ${details.hotel.name} for ${details.details.guests} guests from ${details.details.checkin} to ${details.details.checkout}` 
    }]);
    setIsTyping(true);
    try {
      const res = await api.bookRoom(details.hotel.id, details.details);
      if (res.success) {
        setMessages((m) => [...m, { 
          id: Date.now() + 2, 
          type: "bot", 
          text: `✅ Booking confirmed! Your booking ID is ${res.bookingId}. We've sent the details to your email.` 
        }]);
      } else {
        setMessages((m) => [...m, { 
          id: Date.now() + 2, 
          type: "bot", 
          text: `❌ Booking failed: ${res.error || 'Please try again later.'}` 
        }]);
      }
    } catch (err) {
      setMessages((m) => [...m, { 
        id: Date.now() + 2, 
        type: "bot", 
        text: `❌ Booking failed due to a network error. Please check your connection and try again.` 
      }]);
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  }

  // Get current suggestions from last bot message
  const lastBotMessage = [...messages].reverse().find((m) => m.type === 'bot');
  const currentSuggestions = lastBotMessage?.suggestions || [];

  return (
    <div className="hotel-chatbot">
      <div className="hotel-chatbot__container">

        {/* Messages Container */}
        <div 
          ref={containerRef} 
          className="hotel-chatbot__messages-container"
        >
          <div className="hotel-chatbot__messages">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`hotel-chatbot__message-wrapper ${m.type === "user" ? "user-wrapper" : "bot-wrapper"}`}
              >
                <Message m={m} />
              </div>
            ))}

            {isTyping && (
              <div className="hotel-chatbot__typing-indicator">
                <div className="hotel-chatbot__typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="hotel-chatbot__typing-text">ShelterSeek bot is typing...</div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="hotel-chatbot__input-area">
          <div className="hotel-chatbot__input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask me anything about hotels, bookings, or destinations..."
              className="hotel-chatbot__input"
            />
            <button 
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="hotel-chatbot__send-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Quick Suggestions */}
          {currentSuggestions.length > 0 && (
            <div className="hotel-chatbot__suggestions">
              <div className="hotel-chatbot__suggestions-label">Quick suggestions:</div>
              <div className="hotel-chatbot__suggestions-list">
                {currentSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => onSuggestionClick(s)}
                    className="hotel-chatbot__suggestion-btn"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal && (
        <div className="hotel-chatbot__modal-overlay">
          <div className="hotel-chatbot__modal">
            <div className="hotel-chatbot__modal-header">
              <div>
                <h3 className="hotel-chatbot__modal-title">Confirm Your Booking</h3>
                <p className="hotel-chatbot__modal-subtitle">
                  {bookingModal.hotel.name} · {bookingModal.hotel.location}
                </p>
              </div>
              <button 
                className="hotel-chatbot__modal-close"
                onClick={() => setBookingModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="hotel-chatbot__modal-content">
              <div className="hotel-chatbot__modal-form">
                <div className="hotel-chatbot__form-group">
                  <label htmlFor="guestname" className="hotel-chatbot__form-label">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    id="guestname"
                    className="hotel-chatbot__form-input"
                    defaultValue={bookingModal.details.name}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="hotel-chatbot__form-row">
                  <div className="hotel-chatbot__form-group">
                    <label htmlFor="checkin" className="hotel-chatbot__form-label">
                      Check-in Date *
                    </label>
                    <input
                      type="date"
                      id="checkin"
                      className="hotel-chatbot__form-input"
                      defaultValue={bookingModal.details.checkin}
                    />
                  </div>
                  <div className="hotel-chatbot__form-group">
                    <label htmlFor="checkout" className="hotel-chatbot__form-label">
                      Check-out Date *
                    </label>
                    <input
                      type="date"
                      id="checkout"
                      className="hotel-chatbot__form-input"
                      defaultValue={bookingModal.details.checkout}
                    />
                  </div>
                </div>

                <div className="hotel-chatbot__form-row">
                  <div className="hotel-chatbot__form-group">
                    <label htmlFor="guests" className="hotel-chatbot__form-label">
                      Number of Guests *
                    </label>
                    <input
                      type="number"
                      id="guests"
                      className="hotel-chatbot__form-input"
                      defaultValue={bookingModal.details.guests}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div className="hotel-chatbot__form-group">
                    <label htmlFor="nights" className="hotel-chatbot__form-label">
                      Number of Nights
                    </label>
                    <input
                      type="number"
                      id="nights"
                      className="hotel-chatbot__form-input"
                      defaultValue={bookingModal.details.nights}
                      min="1"
                      max="30"
                    />
                  </div>
                </div>

                <div className="hotel-chatbot__price-summary">
                  <div className="hotel-chatbot__price-item">
                    <span>Room Price</span>
                    <span>${bookingModal.hotel.price}/night</span>
                  </div>
                  <div className="hotel-chatbot__price-item total">
                    <span>Estimated Total</span>
                    <span>${bookingModal.hotel.price * bookingModal.details.nights}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hotel-chatbot__modal-footer">
              <button
                className="hotel-chatbot__modal-btn secondary"
                onClick={() => setBookingModal(null)}
              >
                Cancel
              </button>
              <button
                className="hotel-chatbot__modal-btn primary"
                onClick={() => {
                  const details = {
                    hotel: bookingModal.hotel,
                    details: {
                      name: document.getElementById('guestname').value,
                      checkin: document.getElementById('checkin').value,
                      checkout: document.getElementById('checkout').value,
                      guests: parseInt(document.getElementById('guests').value || '2', 10),
                      nights: parseInt(document.getElementById('nights').value || '3', 10),
                    }
                  };
                  if (!details.details.name.trim()) {
                    alert("Please enter your name");
                    return;
                  }
                  confirmBooking(details);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Confirm & Book Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}