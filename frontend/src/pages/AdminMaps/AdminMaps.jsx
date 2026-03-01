import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminMaps = () => {
  const [hosts, setHosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 780 : false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 780);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Function to get host image - using room's first image as fallback
  const getHostImage = (room) => {
    // First, try hostImage field
    if (room.hostImage) {
      if (room.hostImage.startsWith('http')) {
        return room.hostImage;
      }
      if (/^[0-9a-fA-F]{24}$/.test(room.hostImage)) {
        return `http://localhost:3001/api/images/${room.hostImage}`;
      }
    }
    
    // If no hostImage, try to use first room image
    if (room.images && room.images.length > 0 && room.images[0]) {
      const firstImage = room.images[0];
      if (/^[0-9a-fA-F]{24}$/.test(firstImage)) {
        return `http://localhost:3001/api/images/${firstImage}`;
      }
    }
    
    // Fallback to logo
    return '/images/logo.png';
  };

  const fetchHostsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch rooms data
      const roomsResponse = await fetch('http://localhost:3001/api/rooms');
      
      if (!roomsResponse.ok) {
        throw new Error(`Failed to fetch rooms: ${roomsResponse.status}`);
      }
      
      const responseData = await roomsResponse.json();
      console.log('Rooms API response:', responseData);
      
      let roomsArray = [];
      
      // Based on the API response structure you showed
      if (responseData.status === "success" && Array.isArray(responseData.data)) {
        roomsArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        roomsArray = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        roomsArray = responseData.data;
      } else {
        console.warn('Unexpected rooms data structure:', responseData);
        roomsArray = [];
      }
      
      console.log('Number of rooms found:', roomsArray.length);
      console.log('First room sample:', roomsArray[0]);
      
      // Group rooms by host email to get unique hosts
      const hostMap = new Map();
      
      roomsArray.forEach(room => {
        const hostEmail = room.email || room.hostEmail;
        
        if (!hostEmail) {
          console.log('Room missing email:', room.title || room._id);
          return;
        }
        
        if (hostMap.has(hostEmail)) {
          // Update existing host - increment room count
          const existingHost = hostMap.get(hostEmail);
          hostMap.set(hostEmail, {
            ...existingHost,
            roomCount: existingHost.roomCount + 1,
            rooms: [...existingHost.rooms, room]
          });
        } else {
          // Create new host entry
          hostMap.set(hostEmail, {
            _id: room._id || `host-${Date.now()}-${Math.random()}`,
            name: room.name || 'Unknown Host',
            email: hostEmail,
            image: getHostImage(room),
            location: room.location,
            coordinates: room.coordinates,
            hostGender: room.hostGender,
            yearsWithUs: room.yearsWithUs || 0,
            phone: room.phone || '',
            createdAt: room.createdAt,
            roomCount: 1,
            rooms: [room]
          });
        }
      });
      
      // Convert map to array and sort by room count
      let hostsArray = Array.from(hostMap.values())
        .sort((a, b) => b.roomCount - a.roomCount);
      
      console.log('Hosts extracted from rooms:', hostsArray.length, hostsArray);
      
      // Set hosts state
      setHosts(hostsArray);
      
    } catch (err) {
      console.error('Error fetching rooms data:', err);
      setError(err.message);
      
      // Fallback to hosts API
      try {
        console.log('Trying fallback to hosts API...');
        const hostsResponse = await fetch('http://localhost:3001/api/hosts');
        
        if (hostsResponse.ok) {
          const hostsData = await hostsResponse.json();
          console.log('Hosts API fallback response:', hostsData);
          
          let hostsArray = [];
          if (Array.isArray(hostsData)) {
            hostsArray = hostsData;
          } else if (hostsData && Array.isArray(hostsData.hosts)) {
            hostsArray = hostsData.hosts;
          } else if (hostsData && Array.isArray(hostsData.data)) {
            hostsArray = hostsData.data;
          }
          
          // Filter to only include hosts
          const filteredHosts = hostsArray.filter(host => {
            const isHost = 
              host.accountType === 'host' ||
              host.role === 'host' ||
              host.userType === 'host' ||
              (!host.accountType && !host.role && !host.userType);
            return isHost;
          });
          
          // Process hosts
          const processedHosts = filteredHosts.map(host => ({
            ...host,
            _id: host._id || host.id || `host-${Date.now()}-${Math.random()}`,
            name: host.name || 'Unknown Host',
            email: host.email || host.userEmail || '',
            image: host.image ? 
              (host.image.startsWith('http') ? host.image : `http://localhost:3001${host.image}`) 
              : '/images/logo.png',
            location: host.location || '',
            roomCount: 0,
            rooms: []
          }));
          
          setHosts(processedHosts);
          setError('Loaded hosts from fallback API: ' + err.message);
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        setHosts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostsData();
  }, []);

  const filteredHosts = hosts.filter(host =>
    (host.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (host.email ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (host.location ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    container: {
      maxWidth: 1200,
      margin: '0 auto',
      padding: isMobile ? 16 : 40,
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: '#ffffff',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center',
      marginBottom: 40,
      position: 'relative'
    },
    title: {
      fontSize: isMobile ? 28 : 42,
      fontWeight: 800,
      background: 'linear-gradient(135deg, #ec4899 0%, #be185d 50%, #9f1239 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: 12,
      letterSpacing: '-0.5px',
      textShadow: '0 2px 20px rgba(236, 72, 153, 0.15)'
    },
    subtitle: {
      fontSize: isMobile ? 14 : 16,
      color: '#6b7280',
      fontWeight: 500,
      opacity: 0.8
    },
    searchSection: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 32,
      position: 'relative'
    },
    searchWrapper: {
      position: 'relative',
      width: isMobile ? '100%' : 420
    },
    pillInput: {
      width: '100%',
      padding: '16px 24px 16px 50px',
      borderRadius: 50,
      border: '2px solid #f3f4f6',
      fontSize: 15,
      outline: 'none',
      background: '#ffffff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      color: '#1f2937'
    },
    searchIcon: {
      position: 'absolute',
      left: 20,
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#ec4899',
      fontSize: 18,
      pointerEvents: 'none'
    },
    statsBar: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: isMobile ? 12 : 20,
      marginBottom: 32
    },
    statCard: {
      background: '#ffffff',
      padding: isMobile ? 20 : 28,
      borderRadius: 20,
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    },
    statCardGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: 'linear-gradient(90deg, #ec4899, #be185d, #9f1239)',
      opacity: 0.8
    },
    statValue: {
      fontSize: isMobile ? 32 : 42,
      fontWeight: 800,
      background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: 1.2,
      marginBottom: 8
    },
    statLabel: {
      fontSize: isMobile ? 13 : 14,
      color: '#9f1239',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    tableWrap: {
      overflowX: 'auto',
      borderRadius: 24,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      background: '#ffffff',
      border: '1px solid #f3f4f6'
    },
    table: {
      width: '100%',
      minWidth: 640,
      borderCollapse: 'collapse'
    },
    thead: {
      background: 'linear-gradient(135deg, #ec4899 0%, #be185d 50%, #9f1239 100%)',
      color: '#fff'
    },
    th: {
      padding: '18px 24px',
      textAlign: 'left',
      fontSize: 13,
      letterSpacing: '0.8px',
      fontWeight: 700,
      textTransform: 'uppercase',
      borderBottom: '3px solid rgba(255, 255, 255, 0.2)'
    },
    td: {
      padding: '18px 24px',
      borderBottom: '1px solid #f3f4f6',
      fontSize: 15,
      color: '#374151'
    },
    trHover: {
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      willChange: 'background'
    },
    btnView: {
      background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      color: 'white',
      padding: '10px 24px',
      borderRadius: 50,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      boxShadow: '0 8px 24px rgba(236, 72, 153, 0.35)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    },
    mobileCard: {
      background: '#ffffff',
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    },
    mobileCardBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: 'linear-gradient(90deg, #ec4899, #be185d)',
      opacity: 0.6
    },
    mobileRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16
    },
    label: { 
      fontWeight: 700, 
      color: '#374151',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: 6
    },
    value: { 
      color: '#1f2937',
      fontSize: 15,
      fontWeight: 500
    },
    loading: {
      textAlign: 'center',
      padding: 60,
      fontSize: 18,
      color: '#be185d',
      fontWeight: 500
    },
    loadingSpinner: {
      display: 'inline-block',
      width: 40,
      height: 40,
      border: '4px solid rgba(236, 72, 153, 0.2)',
      borderTopColor: '#ec4899',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      marginBottom: 16
    },
    errorContainer: {
      background: 'linear-gradient(135deg, rgba(254, 226, 226, 0.95) 0%, rgba(252, 165, 165, 0.15) 100%)',
      border: '2px solid #fca5a5',
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
      boxShadow: '0 8px 32px rgba(252, 165, 165, 0.2)'
    },
    errorTitle: {
      fontWeight: 700,
      marginBottom: 8,
      color: '#991b1b',
      fontSize: 16
    },
    retryButton: {
      background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: 50,
      cursor: 'pointer',
      marginTop: 12,
      fontSize: 13,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 16px rgba(236, 72, 153, 0.3)',
      transition: 'all 0.3s ease'
    },
    roomCountBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 16px',
      borderRadius: 50,
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
      minWidth: 80
    },
    roomCountMany: {
      background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
      color: '#9f1239',
      boxShadow: '0 2px 8px rgba(236, 72, 153, 0.15)'
    },
    roomCountSome: {
      background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
      color: '#be185d',
      boxShadow: '0 2px 8px rgba(190, 24, 93, 0.12)'
    },
    roomCountNone: {
      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      color: '#6b7280',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    },
    emptyMsg: {
      textAlign: 'center',
      padding: 60,
      color: '#6b7280',
      fontSize: 16,
      fontWeight: 500,
      background: '#ffffff',
      borderRadius: 20,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f3f4f6'
    },
    hostName: {
      fontWeight: 600,
      color: '#1f2937',
      fontSize: 15
    },
    hostImage: {
      width: 48,
      height: 48,
      borderRadius: '50%',
      objectFit: 'cover',
      marginRight: 12,
      border: '2px solid #f3f4f6',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      backgroundColor: '#f3f4f6'
    },
    hostInfo: {
      display: 'flex',
      alignItems: 'center'
    },
    mobileHostImage: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      objectFit: 'cover',
      marginRight: 12,
      border: '2px solid #f3f4f6',
      backgroundColor: '#f3f4f6'
    },
    hostDetails: {
      display: 'flex',
      flexDirection: 'column'
    },
    hostMeta: {
      fontSize: 12,
      color: '#6b7280',
      marginTop: 2
    },
    refreshButton: {
      position: 'absolute',
      right: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: 50,
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 16px rgba(236, 72, 153, 0.3)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  };

  const totalHosts = hosts.length;
  const totalRooms = hosts.reduce((sum, host) => sum + (host.roomCount || 0), 0);
  const hostsWithRooms = hosts.filter(host => (host.roomCount || 0) > 0).length;

  const getRoomCountStyle = (count) => {
    if (count >= 5) return { ...styles.roomCountBadge, ...styles.roomCountMany };
    if (count >= 1) return { ...styles.roomCountBadge, ...styles.roomCountSome };
    return { ...styles.roomCountBadge, ...styles.roomCountNone };
  };

  const handleImageError = (e) => {
    console.log('Image failed to load:', e.target.src);
    e.target.onerror = null;
    e.target.src = '/images/logo.png';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          /* Hide scrollbar for Chrome, Safari and Opera */
          ::-webkit-scrollbar {
            display: none;
          }
          
          /* Hide scrollbar for IE, Edge and Firefox */
          * {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>
        <div style={styles.header}>
          <h1 style={styles.title}>Hosts Management</h1>
        </div>
        <div style={styles.loading}>
          <div style={styles.loadingSpinner}></div>
          <div>Loading hosts and room data...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        * {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      
      <div style={styles.header}>
        <h1 style={styles.title}>Hosts Management</h1>
        <p style={styles.subtitle}>Manage and monitor all your property hosts</p>
        <button 
          style={styles.refreshButton}
          onClick={fetchHostsData}
          onMouseEnter={e => e.target.style.transform = 'translateY(-50%) scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'translateY(-50%) scale(1)'}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div style={styles.errorContainer}>
          <div style={styles.errorTitle}>⚠️ Warning</div>
          <div style={{ color: '#991b1b', fontSize: 14 }}>{error}</div>
          <button 
            style={styles.retryButton}
            onClick={fetchHostsData}
            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            Retry Loading
          </button>
        </div>
      )}

      <div style={styles.statsBar}>
        <div 
          style={styles.statCard}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={styles.statCardGlow}></div>
          <div style={styles.statValue}>{totalHosts}</div>
          <div style={styles.statLabel}>Total Hosts</div>
        </div>
        <div 
          style={styles.statCard}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={styles.statCardGlow}></div>
          <div style={styles.statValue}>{totalRooms}</div>
          <div style={styles.statLabel}>Total Rooms</div>
        </div>
        <div 
          style={styles.statCard}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={styles.statCardGlow}></div>
          <div style={styles.statValue}>{hostsWithRooms}</div>
          <div style={styles.statLabel}>Active Hosts</div>
        </div>
      </div>

      <div style={styles.searchSection}>
        <div style={styles.searchWrapper}>
          <div style={styles.searchIcon}>🔍</div>
          <input
            type="text"
            style={styles.pillInput}
            placeholder="Search hosts by name, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = '#ec4899';
              e.target.style.boxShadow = '0 12px 48px rgba(236, 72, 153, 0.2), 0 4px 12px rgba(0, 0, 0, 0.06)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'transparent';
              e.target.style.boxShadow = '0 8px 32px rgba(236, 72, 153, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)';
            }}
            aria-label="Search hosts"
          />
        </div>
      </div>

      {filteredHosts.length > 0 ? (
        !isMobile ? (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Host Profile</th>
                  <th style={styles.th}>Contact Info</th>
                  <th style={styles.th}>Rooms</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHosts.map(host => (
                  <tr
                    key={host._id}
                    style={styles.trHover}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#fafafa';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={styles.td}>
                      <div style={styles.hostInfo}>
                        <img 
                          src={host.image} 
                          alt={host.name}
                          style={styles.hostImage}
                          onError={handleImageError}
                          loading="lazy"
                        />
                        <div style={styles.hostDetails}>
                          <div style={styles.hostName}>{host.name}</div>
                          {host.location && (
                            <div style={styles.hostMeta}>
                              📍 {host.location}
                            </div>
                          )}
                          {host.hostGender && (
                            <div style={styles.hostMeta}>
                              {host.hostGender === 'Female' ? '👩' : '👨'} {host.hostGender}
                            </div>
                          )}
                          {host.yearsWithUs > 0 && (
                            <div style={styles.hostMeta}>
                              ⏳ {host.yearsWithUs} year{host.yearsWithUs !== 1 ? 's' : ''} with us
                            </div>
                          )}
                          {host.createdAt && (
                            <div style={styles.hostMeta}>
                              📅 Joined: {formatDate(host.createdAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: 14 }}>
                        <div style={{ marginBottom: 4 }}>
                          <strong>Email:</strong> {host.email || 'N/A'}
                        </div>
                        {host.phone && (
                          <div style={{ color: '#6b7280' }}>
                            <strong>Phone:</strong> {host.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={getRoomCountStyle(host.roomCount)}>
                        {host.roomCount || 0} {host.roomCount === 1 ? 'room' : 'rooms'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.btnView}
                        onClick={() => navigate(`/admin/maps/${encodeURIComponent(host.email)}`)}
                        onMouseEnter={e => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 12px 32px rgba(236, 72, 153, 0.45)';
                        }}
                        onMouseLeave={e => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 8px 24px rgba(236, 72, 153, 0.35)';
                        }}
                        aria-label={`View map for ${host.name}`}
                        disabled={!host.email}
                      >
                        {host.email ? 'View Map' : 'No Email'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            {filteredHosts.map(host => (
              <div 
                key={host._id} 
                style={styles.mobileCard}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 16px 48px rgba(236, 72, 153, 0.2), 0 4px 12px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(236, 72, 153, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)';
                }}
              >
                <div style={styles.mobileCardBorder}></div>
                <div style={styles.mobileRow}>
                  <div style={styles.hostInfo}>
                    <img 
                      src={host.image} 
                      alt={host.name}
                      style={styles.mobileHostImage}
                      onError={handleImageError}
                      loading="lazy"
                    />
                    <div>
                      <div style={{ ...styles.value, fontWeight: 600 }}>{host.name}</div>
                      {host.location && (
                        <div style={{ color: '#6b7280', fontSize: 10 }}>
                          📍 {host.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={styles.label}>Rooms</div>
                    <span style={getRoomCountStyle(host.roomCount)}>
                      {host.roomCount || 0} {host.roomCount === 1 ? 'room' : 'rooms'}
                    </span>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={styles.label}>Email</div>
                  <div style={{ ...styles.value, fontSize: 13 }}>{host.email || 'N/A'}</div>
                </div>
                {host.phone && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={styles.label}>Phone</div>
                    <div style={{ ...styles.value, fontSize: 13 }}>{host.phone}</div>
                  </div>
                )}
                {(host.yearsWithUs > 0 || host.createdAt) && (
                  <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                    {host.yearsWithUs > 0 && (
                      <div>
                        <div style={styles.label}>Years with us</div>
                        <div style={{ ...styles.value, fontSize: 13 }}>
                          {host.yearsWithUs} year{host.yearsWithUs !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                    {host.createdAt && (
                      <div>
                        <div style={styles.label}>Joined</div>
                        <div style={{ ...styles.value, fontSize: 13 }}>
                          {formatDate(host.createdAt)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <button
                  style={{ ...styles.btnView, width: '100%', justifyContent: 'center', display: 'flex' }}
                  onClick={() => {
                    if (host.email) {
                      navigate(`/admin/maps/${encodeURIComponent(host.email)}`);
                    }
                  }}
                  onMouseEnter={e => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 32px rgba(236, 72, 153, 0.45)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 24px rgba(236, 72, 153, 0.35)';
                  }}
                  disabled={!host.email}
                >
                  {host.email ? 'View Map' : 'No Email'}
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <div style={styles.emptyMsg}>
          {searchTerm ? '🔍 No hosts match your search.' : '📋 No hosts found.'}
        </div>
      )}
    </div>
  );
};

export default AdminMaps;
