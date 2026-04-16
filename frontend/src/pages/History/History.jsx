import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './History.css';

const DEFAULT_IMAGE = '/images/default-house.jpg';

const History = () => {
  const [historyRooms, setHistoryRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const parseLocalHistory = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('viewedHomes') || '[]');
      if (!Array.isArray(stored)) return [];
      return stored.map((roomId, index) => ({ roomId, order: index }));
    } catch (err) {
      console.error('Failed to parse local history:', err);
      return [];
    }
  }, []);

  const getPrimaryImage = (room) => {
    if (!Array.isArray(room.images) || room.images.length === 0) {
      return DEFAULT_IMAGE;
    }
    const first = room.images[0];
    if (typeof first !== 'string' || first.length === 0) return DEFAULT_IMAGE;
    if (first.startsWith('http')) return first;
    if (first.startsWith('/')) return `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${first}`;
    // ObjectId string OR filename — both served by /api/images/:id
    return `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/images/${first}`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatViewedAt = (dateString) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'recently';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
  
    try {
      let historyEntries = [];
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
  
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.accountType === 'traveller') {
            const response = await fetch('${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/users/traveler/viewed-rooms', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
  
            if (response.ok) {
              const data = await response.json();
              console.log('Viewed rooms API response:', data); // Debug log
              
              // Extract viewedRooms from response
              const viewedRooms = data.viewedRooms || [];
              console.log('Extracted viewed rooms:', viewedRooms); // Debug log
              
              // Map the data correctly
              historyEntries = viewedRooms.map((entry, index) => {
                // Handle different possible structures
                const roomId = entry.roomId || entry._id || entry;
                const viewedAt = entry.viewedAt || entry.timestamp || new Date().toISOString();
                
                return {
                  roomId: roomId.toString(), // Ensure it's a string
                  viewedAt: viewedAt,
                  order: index
                };
              });
              
              console.log('Processed history entries:', historyEntries); // Debug log
              
              // Store in localStorage as backup
              localStorage.setItem('viewedHomes', JSON.stringify(historyEntries.map(entry => entry.roomId)));
            } else {
              console.warn('Viewed rooms API failed:', response.status);
              historyEntries = parseLocalHistory();
            }
          } else {
            historyEntries = parseLocalHistory();
          }
        } catch (err) {
          console.error('Traveler history fetch error:', err);
          historyEntries = parseLocalHistory();
        }
      } else {
        historyEntries = parseLocalHistory();
      }
  
      if (!historyEntries.length) {
        console.log('No history entries found');
        setHistoryRooms([]);
        return;
      }
  
      console.log('Fetching room details for:', historyEntries.length, 'entries');
      
      // Fetch all rooms
      const roomsResponse = await fetch('${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/rooms');
      if (!roomsResponse.ok) {
        throw new Error(`Failed to fetch rooms (status ${roomsResponse.status})`);
      }
  
      const roomsResult = await roomsResponse.json();
      console.log('Rooms API response:', roomsResult); // Debug log
      
      if (roomsResult.status !== 'success' || !Array.isArray(roomsResult.data)) {
        throw new Error('Unexpected rooms response format');
      }
  
      // Create a map for quick lookup
      const roomMap = new Map();
      roomsResult.data.forEach(room => {
        const id = room._id || room.id;
        if (id) {
          roomMap.set(id.toString(), room);
        }
      });
  
      console.log('Room map size:', roomMap.size); // Debug log
      
      // Match history entries with room data
      const matched = historyEntries
        .map(entry => {
          const room = roomMap.get(entry.roomId.toString());
          if (!room) {
            console.log('Room not found for ID:', entry.roomId);
            return null;
          }
          return { 
            room, 
            viewedAt: entry.viewedAt, 
            order: entry.order 
          };
        })
        .filter(Boolean)
        .sort((a, b) => {
          // Sort by viewedAt if available, otherwise by order
          if (a.viewedAt && b.viewedAt) {
            return new Date(b.viewedAt) - new Date(a.viewedAt);
          }
          if (a.viewedAt) return -1;
          if (b.viewedAt) return 1;
          return a.order - b.order;
        });
  
      console.log('Matched rooms:', matched.length); // Debug log
      setHistoryRooms(matched);
    } catch (err) {
      console.error('History fetch error:', err);
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [parseLocalHistory]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleClearHistory = async () => {
    // Clear local storage
    localStorage.setItem('viewedHomes', JSON.stringify([]));
    
    // If user is logged in, try to clear server history
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.accountType === 'traveller') {
          // Optionally call an endpoint to clear server history
          await fetch('${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/users/traveler/clear-history', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (err) {
        console.error('Failed to clear server history:', err);
      }
    }
    
    setHistoryRooms([]);
  };

  return (
    <>
      <Navbar />
      <div className="history-page">
        <div className="history-header">
          <div>
            <h1>Viewing History</h1>
            <p>Jump back into rooms you recently explored.</p>
          </div>
          {historyRooms.length > 0 && (
            <button className="history-clear-btn" onClick={handleClearHistory}>
              Clear history
            </button>
          )}
        </div>

        {loading && (
          <div className="history-placeholder">
            Loading your recently viewed rooms...
          </div>
        )}

        {!loading && error && (
          <div className="history-error">
            <p>{error}</p>
            <button onClick={fetchHistory}>Try again</button>
          </div>
        )}

        {!loading && !error && historyRooms.length === 0 && (
          <div className="history-empty">
            <h2>No recently viewed rooms</h2>
            <p>Start exploring homes to see them appear here.</p>
            <button onClick={() => navigate('/')}>Explore homes</button>
          </div>
        )}

        {!loading && !error && historyRooms.length > 0 && (
          <div className="history-grid">
            {historyRooms.map(({ room, viewedAt }, index) => {
              const priceAfterDiscount = room.price * (1 - (room.discount || 0) / 100);
              return (
                <div key={`${room._id || room.id}-${index}`} className="history-card">
                  <div className="history-card-meta">
                    <span className="history-viewed-chip">
                      Viewed {formatViewedAt(viewedAt)}
                    </span>
                    <button
                      className="history-view-button"
                      onClick={() => navigate(`/room/${room._id || room.id}`)}
                    >
                      View details
                    </button>
                  </div>
                  <div className="history-card-body">
                    <div
                      className="history-card-image"
                      style={{ backgroundImage: `url('${getPrimaryImage(room)}')` }}
                    />
                    <div className="history-card-info">
                      <h3>{room.title || 'Untitled Property'}</h3>
                      <p className="history-location">{room.location || 'Location not specified'}</p>
                      <p className="history-description">
                        {room.description || 'No description available'}
                      </p>
                      <div className="history-price-row">
                        <span className="history-price">
                          {formatCurrency(priceAfterDiscount)} / night
                        </span>
                        {room.discount > 0 && (
                          <span className="history-discount">
                            {room.discount}% off
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default History;


