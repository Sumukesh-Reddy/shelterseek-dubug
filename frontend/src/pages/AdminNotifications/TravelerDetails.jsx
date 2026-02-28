import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function TravelerDetails() {
  const { email } = useParams();
  const [travelerData, setTravelerData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 820 : false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 820);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTravelerDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:3001/api/bookings/traveler/${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setTravelerData(data.traveler);
          setBookings(data.bookings);
        } else {
          setError(data.message || 'Failed to fetch traveler details');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to fetch traveler details');
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchTravelerDetails();
    }
  }, [email]);

  // Style definitions
  const colors = {
    primary: {
      dark: '#0f172a',
      main: '#1e293b',
      light: '#334155'
    },
    secondary: {
      dark: '#0369a1',
      main: '#0ea5e9',
      light: '#7dd3fc'
    },
    accent: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#8b5cf6'
    },
    neutral: {
      white: '#ffffff',
      light: '#f8fafc',
      gray: '#64748b',
      darkGray: '#475569'
    }
  };

  const styles = {
    container: {
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      padding: isMobile ? '20px 16px' : '32px 24px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: colors.primary.dark
    },

    contentWrapper: {
      maxWidth: 1200,
      margin: '0 auto',
      background: colors.neutral.white,
      borderRadius: '16px',
      boxShadow: '0 8px 40px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06)',
      border: `1px solid ${colors.neutral.light}`,
      overflow: 'hidden'
    },

    headerSection: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: isMobile ? '24px 20px' : '32px 28px',
      color: colors.neutral.white,
      position: 'relative'
    },

    backBtn: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '10px 16px',
      borderRadius: '10px',
      cursor: 'pointer',
      color: colors.neutral.white,
      fontWeight: '600',
      fontSize: '14px',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: 'fit-content',
      marginBottom: '16px'
    },

    title: {
      fontSize: isMobile ? '24px' : '32px',
      fontWeight: '700',
      margin: '0 0 8px 0'
    },

    subtitle: {
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.8)',
      margin: '0',
      fontWeight: '500'
    },

    mainContent: {
      padding: isMobile ? '24px 20px' : '32px 28px'
    },

    // Traveler Info Card
    travelerCard: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '12px',
      padding: isMobile ? '20px' : '28px',
      marginBottom: '28px',
      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
      border: `1px solid ${colors.neutral.light}`,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '20px' : '40px',
      alignItems: isMobile ? 'flex-start' : 'center'
    },

    travelerAvatar: {
      width: isMobile ? '80px' : '100px',
      height: isMobile ? '80px' : '100px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.neutral.white,
      fontSize: isMobile ? '32px' : '40px',
      fontWeight: '700',
      boxShadow: '0 8px 24px rgba(14, 165, 233, 0.25)'
    },

    travelerInfo: {
      flex: 1
    },

    travelerName: {
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: '700',
      margin: '0 0 8px 0',
      color: colors.primary.dark
    },

    travelerEmail: {
      fontSize: '15px',
      color: colors.neutral.gray,
      margin: '0 0 12px 0'
    },

    infoGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginTop: '16px'
    },

    infoItem: {
      padding: '12px 16px',
      background: colors.neutral.light,
      borderRadius: '8px',
      borderLeft: `4px solid ${colors.secondary.main}`
    },

    infoLabel: {
      fontSize: '12px',
      color: colors.neutral.gray,
      fontWeight: '600',
      margin: '0 0 4px 0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },

    infoValue: {
      fontSize: '16px',
      fontWeight: '700',
      color: colors.primary.dark,
      margin: '0'
    },

    // Bookings Section
    bookingsSection: {
      marginTop: '32px'
    },

    sectionTitle: {
      fontSize: isMobile ? '18px' : '22px',
      fontWeight: '700',
      margin: '0 0 20px 0',
      color: colors.primary.dark,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },

    tableContainer: {
      overflowX: 'auto',
      borderRadius: '12px',
      border: `1px solid ${colors.neutral.light}`,
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)'
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '900px'
    },

    tableHeader: {
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
    },

    tableHeaderCell: {
      padding: isMobile ? '16px 12px' : '20px 16px',
      textAlign: 'left',
      fontSize: '13px',
      fontWeight: '600',
      color: colors.neutral.white,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: `1px solid ${colors.primary.light}`
    },

    tableRow: {
      transition: 'background-color 0.2s ease',
      borderBottom: `1px solid ${colors.neutral.light}`
    },

    tableCell: {
      padding: isMobile ? '16px 12px' : '20px 16px',
      fontSize: '14px',
      color: colors.primary.main,
      fontWeight: '500'
    },

    // Status Badges
    statusBadge: (status) => ({
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
      background: status === 'confirmed' 
        ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
        : status === 'pending'
        ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
        : 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
      color: colors.neutral.white,
      display: 'inline-block'
    }),

    paymentBadge: (status) => ({
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
      background: status === 'completed' 
        ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
        : status === 'pending'
        ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      color: colors.neutral.white,
      display: 'inline-block'
    }),

    // Loading and Error States
    loadingState: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px 20px',
      flexDirection: 'column',
      gap: '16px'
    },

    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: `3px solid ${colors.neutral.light}`,
      borderTop: `3px solid ${colors.secondary.main}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },

    errorState: {
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      border: `1px solid ${colors.accent.error}`,
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      margin: '20px 0'
    },

    errorText: {
      color: colors.accent.error,
      fontWeight: '600',
      margin: '0'
    },

    noBookings: {
      textAlign: 'center',
      padding: '60px 20px',
      color: colors.neutral.gray
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.contentWrapper}>
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner}></div>
            <p style={{ color: colors.neutral.gray }}>Loading traveler details...</p>
          </div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.contentWrapper}>
          <div style={styles.errorState}>
            <p style={styles.errorText}>⚠️ {error}</p>
            <button 
              style={styles.backBtn}
              onClick={() => navigate(-1)}
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalSpent = bookings.reduce((sum, booking) => sum + (booking.totalCost || 0), 0);
  const confirmedBookings = bookings.filter(b => b.bookingStatus === 'confirmed').length;

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        {/* Header Section */}
        <div style={styles.headerSection}>
          <button 
            style={styles.backBtn}
            onClick={() => navigate(-1)}
          >
            ← Back to User Management
          </button>
          
          <h1 style={styles.title}>Traveler Details</h1>
          <p style={styles.subtitle}>
            View all bookings and details for this traveler
          </p>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Traveler Info Card */}
          <div style={styles.travelerCard}>
            <div style={styles.travelerAvatar}>
              {travelerData?.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            
            <div style={styles.travelerInfo}>
              <h2 style={styles.travelerName}>
                {travelerData?.name || 'Unknown Traveler'}
              </h2>
              <p style={styles.travelerEmail}>
                📧 {decodeURIComponent(email)}
              </p>
              
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <p style={styles.infoLabel}>Total Bookings</p>
                  <p style={styles.infoValue}>{bookings.length}</p>
                </div>
                
                <div style={styles.infoItem}>
                  <p style={styles.infoLabel}>Confirmed Bookings</p>
                  <p style={styles.infoValue}>{confirmedBookings}</p>
                </div>
                
                <div style={styles.infoItem}>
                  <p style={styles.infoLabel}>Total Spent</p>
                  <p style={styles.infoValue}>₹{totalSpent.toLocaleString('en-IN')}</p>
                </div>
                
                <div style={styles.infoItem}>
                  <p style={styles.infoLabel}>Member Since</p>
                  <p style={styles.infoValue}>
                    {travelerData?.joinedAt ? new Date(travelerData.joinedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div style={styles.bookingsSection}>
            <h3 style={styles.sectionTitle}>
              <span>📋 Booking History ({bookings.length})</span>
            </h3>

            {bookings.length > 0 ? (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.tableHeaderCell}>Booking ID</th>
                      <th style={styles.tableHeaderCell}>Room</th>
                      <th style={styles.tableHeaderCell}>Check-In</th>
                      <th style={styles.tableHeaderCell}>Check-Out</th>
                      <th style={styles.tableHeaderCell}>Guests</th>
                      <th style={styles.tableHeaderCell}>Amount</th>
                      <th style={styles.tableHeaderCell}>Status</th>
                      <th style={styles.tableHeaderCell}>Payment</th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.bookingId} style={styles.tableRow}>
                        <td style={styles.tableCell}>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>
                            {booking.bookingId?.substring(0, 12)}...
                          </div>
                          {booking.transactionId && (
                            <div style={{ fontSize: '12px', color: colors.neutral.gray }}>
                              TXN: {booking.transactionId.substring(0, 10)}...
                            </div>
                          )}
                        </td>
                        
                        <td style={styles.tableCell}>
                          <div style={{ fontWeight: 600 }}>{booking.roomTitle}</div>
                          {booking.hostEmail && (
                            <div style={{ fontSize: '12px', color: colors.neutral.gray }}>
                              Host: {booking.hostEmail.substring(0, 15)}...
                            </div>
                          )}
                        </td>
                        
                        <td style={styles.tableCell}>
                          {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : '-'}
                        </td>
                        
                        <td style={styles.tableCell}>
                          {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : '-'}
                        </td>
                        
                        <td style={styles.tableCell}>
                          <div style={{ fontWeight: 600 }}>{booking.guests}</div>
                          <div style={{ fontSize: '12px', color: colors.neutral.gray }}>
                            {booking.days} day{booking.days > 1 ? 's' : ''}
                          </div>
                        </td>
                        
                        <td style={styles.tableCell}>
                          <div style={{ fontWeight: 700, color: colors.accent.success }}>
                            ₹{booking.totalCost?.toLocaleString('en-IN') || 0}
                          </div>
                          {booking.paymentMethod && (
                            <div style={{ fontSize: '12px', color: colors.neutral.gray }}>
                              {booking.paymentMethod}
                            </div>
                          )}
                        </td>
                        
                        <td style={styles.tableCell}>
                          <span style={styles.statusBadge(booking.bookingStatus)}>
                            {booking.bookingStatus}
                          </span>
                        </td>
                        
                        <td style={styles.tableCell}>
                          <span style={styles.paymentBadge(booking.paymentStatus)}>
                            {booking.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.noBookings}>
                <h3 style={{ color: colors.neutral.gray, marginBottom: '12px' }}>
                  No bookings found for this traveler
                </h3>
                <p style={{ color: colors.neutral.gray }}>
                  This traveler hasn't made any bookings yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          body {
            margin: 0;
          }
        `}
      </style>
    </div>
  );
}

export default TravelerDetails;