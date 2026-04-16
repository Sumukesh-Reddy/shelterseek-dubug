// components/History/History.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './BookedHistory.css';

const BookedHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookingHistory();
  }, []);

  const fetchBookingHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view booking history');
        setLoading(false);
        return;
      }

      const response = await fetch('${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/bookings/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setBookings(result.bookings || []);
      } else {
        setError(result.message || 'Failed to load booking history');
      }
    } catch (err) {
      console.error('Error fetching booking history:', err);
      setError('Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(number);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  const handleMessage = (booking) => {
    const hostEmail = booking.hostEmail?.trim();
    
    if (!hostEmail) {
      alert("Host email not available for this booking.");
      return;
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      navigate('/traveler-login', {
        state: {
          redirectTo: window.location.pathname,
          message: 'Please login to message the host'
        }
      });
      return;
    }
    
    navigate('/chat', {
      state: {
        startChatWith: {
          email: hostEmail,
          name: booking.hostName || 'Host',
          profilePhoto: booking.hostImage || null
        }
      }
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="history-container">
          <div className="history-loading">
            <div className="spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="history-container">
        <h1 className="history-title">Your Booking History</h1>

        {error && (
          <div className="history-error">
            <p>{error}</p>
            <button onClick={() => navigate('/')}>Go to Home</button>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="history-empty">
            <p>No bookings found.</p>
            <button onClick={() => navigate('/')}>Browse Properties</button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">

                {/* Header */}
                <div className="booking-header">
                  <h3>{booking.roomTitle}</h3>
                  <span className={`booking-status ${getStatusColor(booking.bookingStatus)}`}>
                    {booking.bookingStatus}
                  </span>
                </div>

                {/* Details */}
                <div className="booking-details">

                  {/* BASIC INFO */}
                  <div className="detail-row">
                    <span className="detail-label">Booking ID:</span>
                    <span className="detail-value">{booking.bookingId}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Check-in:</span>
                    <span className="detail-value">{formatDate(booking.checkIn)}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Check-out:</span>
                    <span className="detail-value">{formatDate(booking.checkOut)}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{booking.days} nights</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Guests:</span>
                    <span className="detail-value">{booking.guests}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Total Cost:</span>
                    <span className="detail-value total-cost">{formatCurrency(booking.totalCost)}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Host Email:</span>
                    <span className="detail-value">{booking.hostEmail}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Booked On:</span>
                    <span className="detail-value">{formatDate(booking.bookedAt)}</span>
                  </div>


                  {/* PAYMENT INFORMATION */}
                  <h4 className="sub-heading">Payment Information</h4>

                  <div className="detail-row">
                    <span className="detail-label">Method:</span>
                    <span className="detail-value">{booking.paymentDetails?.paymentMethod}</span>
                  </div>

                  {booking.paymentDetails?.cardLastFour && (
                    <div className="detail-row">
                      <span className="detail-label">Card Last 4:</span>
                      <span className="detail-value">
                        **** **** **** {booking.paymentDetails.cardLastFour}
                      </span>
                    </div>
                  )}

                  {booking.paymentDetails?.upiId && (
                    <div className="detail-row">
                      <span className="detail-label">UPI ID:</span>
                      <span className="detail-value">{booking.paymentDetails.upiId}</span>
                    </div>
                  )}

                  <div className="detail-row">
                    <span className="detail-label">Transaction ID:</span>
                    <span className="detail-value">
                      {booking.paymentDetails?.transactionId}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Payment Date:</span>
                    <span className="detail-value">
                      {formatDate(booking.paymentDetails?.paymentDate)}
                    </span>
                  </div>


                  {/* GUEST DETAILS */}
                  <h4 className="sub-heading">Guest Details</h4>

                  {booking.guestDetails?.map((guest, index) => (
                    <div key={index} className="guest-info">
                      <strong>Guest {index + 1}</strong>
                      <p>Name: {guest.guestName}</p>
                      <p>Age: {guest.guestAge || "N/A"}</p>
                      <p>Gender: {guest.guestGender}</p>
                      <p>Contact: {guest.guestContact}</p>
                      <p>ID Type: {guest.govtIdType}</p>
                      <p>ID Number: {guest.govtIdNumber}</p>
                    </div>
                  ))}

                  {/* SPECIAL REQUESTS */}
                  {booking.specialRequests && (
                    <>
                      <h4 className="sub-heading">Special Requests</h4>
                      <p className="detail-requests">{booking.specialRequests}</p>
                    </>
                  )}

                </div>

                {/* ACTION BUTTONS */}
                <div className="booking-actions">
                  <button 
                    className="message-host-button"
                    onClick={() => handleMessage(booking)}
                  >
                    <FontAwesomeIcon icon={faEnvelope} /> Message Host
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default BookedHistory;