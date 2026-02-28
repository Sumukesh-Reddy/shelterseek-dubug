import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import {
  faUser, faHome, faCalendar, faDollarSign, faSignOutAlt,
  faEdit, faTrash, faImages, faStar, faAlignLeft, faRupeeSign,
  faCalendarCheck, faFilter, faTimes, faSyncAlt, faComment, faEnvelope, faPhone, faIdCard, faUserFriends, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const API_BASE_URL = 'http://localhost:3001';

const styles = {
  dashboard: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  sidebar: {
    width: '250px',
    backgroundColor: 'white',
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    overflowY: 'auto',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
    marginLeft: '270px',  
    flex: 1,
    padding: '2rem',
    minHeight: '100vh',
  },
  logo: { marginBottom: '2rem' },
  logoTitle: { fontSize: '1.5rem', color: '#1f2937', margin: 0 },
  logoSubtitle: { fontSize: '0.875rem', color: '#d72d6e', margin: '0.5rem 0 0' },
  navLinks: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    color: '#4b5563',
    textDecoration: 'none',
    transition: 'all 0.2s',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '1rem',
  },
  navLinkActive: { backgroundColor: '#eff6ff', color: '#d72d6e' },
  navLinkIcon: { marginRight: '0.75rem', fontSize: '1.25rem' },
  searchContainer: { marginBottom: '1.5rem' },
  searchBar: {
    width: '100%',
    maxWidth: '400px',
    padding: '0.75rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    color: '#1f2937',
    outline: 'none',
  },
  listingsSection: { marginBottom: '2rem' },
  listingsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  listingCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  listingCardTitle: { fontSize: '1.25rem', marginBottom: '0.5rem' },
  listingCardText: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' },
  listingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  listingStatusBase: {
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  listingStatusActive: { backgroundColor: '#dcfce7', color: '#166534' },
  listingStatusInactive: { backgroundColor: '#fef2f2', color: '#991b1b' },
  listingStatusPending: { backgroundColor: '#fef3c7', color: '#92400e' },
  listingStatusVerified: { backgroundColor: '#dcfce7', color: '#166534' },
  listingStatusRejected: { backgroundColor: '#fef2f2', color: '#991b1b' },
  listingDetails: { marginTop: '1rem', fontSize: '0.875rem', color: '#1f2937' },
  imagesContainer: { marginTop: '1rem' },
  imageGallery: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' },
  listingImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '0.375rem',
    border: '1px solid #e5e7eb',
    transition: 'transform 0.2s',
  },
  listingActions: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  updateListingBtn: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#d72d6e',
    color: 'white',
  },
  deleteListingBtn: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#991b1b',
    color: 'white',
  },
  suggestionsSimple: {
    margin: '1rem 0',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.375rem',
    borderLeft: '3px solid #d72d6e',
    fontSize: '0.875rem',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    color: '#4b5563',
    textDecoration: 'none',
    transition: 'all 0.2s',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '1rem',
  },
  suggestionsSimpleSuccess: {
    margin: '1rem 0',
    padding: '0.75rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '0.375rem',
    borderLeft: '3px solid #16a34a',
    fontSize: '0.875rem',
    color: '#16a34a',
  },
  suggestionsStrong: { color: '#d72d6e', fontWeight: 600 },
  suggestionsStrongSuccess: { color: '#16a34a', fontWeight: 600 },
  suggestionsList: { margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' },
  suggestionsListItem: { marginBottom: '0.25rem', color: '#6b7280', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '0.5rem' },
};

const HostDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    title: '', location: '', minPrice: '', maxPrice: '', status: 'all',
    propertyType: '', roomType: '', hostGender: '', foodFacility: '',
    roomSize: '', capacity: '', bedrooms: '', beds: ''
  });
  const [analytics, setAnalytics] = useState({});
  const [qrCodes, setQrCodes] = useState({});
  const [realTimeBookings, setRealTimeBookings] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastManualRefresh, setLastManualRefresh] = useState(null);

  // Enhanced logout function
  const handleLogout = () => {
    // Clear all intervals to stop auto refresh
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    // Clear ALL storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies if any
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Force redirect to home with full reload
    window.location.href = '/';
  };

  // Check session on mount
  useEffect(() => {
    const checkSession = () => {
      const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('currentUser') || 'null');
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!user || !token) {
        handleLogout();
        return false;
      }
      return true;
    };

    if (!checkSession()) {
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('currentUser') || 'null');
    if (!user) {
      window.alert('Please login to view the dashboard.');
      navigate('/loginweb');
      return;
    }
    setCurrentUser(user);
    fetchListings(user.email);
    fetchAnalytics();
  }, [navigate]);

  // Auto refresh setup
  useEffect(() => {
    if (currentUser && currentUser.accountType === 'host') {
      // Initial fetch
      fetchHostBookings();
      
      // Set up auto-refresh interval (every 1 second)
      const interval = setInterval(() => {
        fetchHostBookings();
      }, 1000);
      
      setPollingInterval(interval);
      
      // Cleanup interval on component unmount
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [currentUser]);

  // Filter listings
  useEffect(() => {
    const filtered = listings.filter(listing => {
      const matchesSearch = !searchTerm ||
        listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matches = 
        (!filters.title || listing.title?.toLowerCase().includes(filters.title.toLowerCase())) &&
        (!filters.location || listing.location?.toLowerCase().includes(filters.location.toLowerCase())) &&
        (!filters.minPrice || listing.price >= parseInt(filters.minPrice)) &&
        (!filters.maxPrice || listing.price <= parseInt(filters.maxPrice)) &&
        (filters.status === 'all' || listing.status === filters.status) &&
        (!filters.propertyType || listing.propertyType === filters.propertyType) &&
        (!filters.roomType || listing.roomType === filters.roomType) &&
        (!filters.hostGender || listing.hostGender === filters.hostGender) &&
        (!filters.foodFacility || listing.foodFacility === filters.foodFacility) &&
        (!filters.roomSize || listing.roomSize === filters.roomSize) &&
        (!filters.capacity || listing.capacity >= parseInt(filters.capacity)) &&
        (!filters.bedrooms || listing.bedrooms >= parseInt(filters.bedrooms)) &&
        (!filters.beds || listing.beds >= parseInt(filters.beds));

      return matchesSearch && matches;
    });
    setFilteredListings(filtered);
  }, [searchTerm, listings, filters]);

  // Auto-refresh analytics every 30 seconds
  useEffect(() => {
    const analyticsInterval = setInterval(() => {
      if (currentUser) {
        fetchAnalytics();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(analyticsInterval);
  }, [currentUser]);

  const fetchListings = async (email) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/rooms/listings`);
      if (response.data.success) {
        const hostListings = response.data.data.listings.filter(l => l.email === email);
        setListings(hostListings);
        setFilteredListings(hostListings);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/bookings/analytics/host`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAnalytics(response.data.analytics || {});
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchHostBookings = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/bookings/host`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setRealTimeBookings(response.data.bookings);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch host bookings:', error);
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setRefreshCount(prev => prev + 1);
    setLastManualRefresh(new Date());
    
    try {
      // Refresh all data in parallel
      await Promise.all([
        fetchListings(currentUser?.email),
        fetchAnalytics(),
        fetchHostBookings()
      ]);
      console.log('Manual refresh completed');
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/rooms/listings/${listingId}`);
      setListings(prev => prev.filter(l => l._id !== listingId));
      // Auto refresh after delete
      setTimeout(() => {
        fetchListings(currentUser?.email);
      }, 500);
    } catch (error) {
      window.alert('Failed to delete listing');
    }
  };

  const handleUpdate = (listingId) => {
    navigate(`/host_index?listingId=${listingId}`);
  };

  const generateSuggestions = (listing) => {
    const suggestions = [];

    if (!listing.images || listing.images.length === 0) {
      suggestions.push({
        type: 'images',
        priority: 'high',
        icon: faImages,
        title: 'Add Images',
        message: 'No images found. Add at least 5 high-quality photos to increase bookings by 40%.',
      });
    } else if (listing.images.length < 3) {
      suggestions.push({
        type: 'images',
        priority: 'high',
        icon: faImages,
        title: 'More Images Needed',
        message: `Only ${listing.images.length} image(s) uploaded. Add more photos to showcase your space better.`,
      });
    }

    const amenities = listing.amenities || [];
    if (amenities.length === 0) {
      suggestions.push({
        type: 'amenities',
        priority: 'high',
        icon: faStar,
        title: 'Add Amenities',
        message: 'No amenities listed. Essential amenities can increase bookings significantly.',
      });
    }

    const description = listing.description || '';
    if (!description || description.length < 50) {
      suggestions.push({
        type: 'description',
        priority: 'high',
        icon: faAlignLeft,
        title: 'Improve Description',
        message: 'Description is too short or missing. Detailed descriptions increase booking rates.',
      });
    }

    if (!listing.unavailableDates || listing.unavailableDates.length === 0) {
      suggestions.push({
        type: 'unavailableDates',
        priority: 'high',
        icon: faCalendarCheck,
        title: 'Set Unavailable Dates',
        message: 'No unavailable dates set. Set your room unavailable dates to accept bookings.',
      });
    }

    const price = parseFloat(listing.price) || 0;
    if (price === 0) {
      suggestions.push({
        type: 'pricing',
        priority: 'high',
        icon: faRupeeSign,
        title: 'Set Competitive Price',
        message: 'No price set. Research similar listings in your area to set an attractive rate.',
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBookingTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = (now - date) / 1000;
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const isRecentBooking = (booking) => {
    const bookingTime = new Date(booking.bookedAt || booking.createdAt || booking.paymentDate);
    const now = new Date();
    const diffInSeconds = (now - bookingTime) / 1000;
    return diffInSeconds < 60;
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return { bg: '#dcfce7', text: '#166534' };
      case 'pending':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'cancelled':
        return { bg: '#fee2e2', text: '#991b1b' };
      default:
        return { bg: '#e5e7eb', text: '#374151' };
    }
  };

  const toggleBookingDetails = (bookingId) => {
    if (expandedBookingId === bookingId) {
      setExpandedBookingId(null);
    } else {
      setExpandedBookingId(bookingId);
    }
  };

  const handleSectionChange = (section) => setActiveSection(section);

  const generateQRCode = async (listingId) => {
    try {
      console.log('Generating QR code for listing:', listingId);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Token exists:', !!token);

      const response = await axios.get(`${API_BASE_URL}/api/rooms/listings/${listingId}/qr`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('QR code response:', response.data);

      if (response.data.success) {
        setQrCodes(prev => ({
          ...prev,
          [listingId]: response.data
        }));
        console.log('QR code generated successfully');
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to generate QR code: ' + (error.response?.data?.message || error.message));
    }
  };

  const downloadQRCode = (listingId, title) => {
    const qrData = qrCodes[listingId];
    if (!qrData) return;

    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `QR_${title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareQRCode = async (listingId) => {
    const qrData = qrCodes[listingId];
    if (!qrData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out this listing: ${qrData.listingTitle}`,
          text: `Scan this QR code to view the listing: ${qrData.listingTitle}`,
          url: qrData.listingUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
        navigator.clipboard.writeText(qrData.listingUrl);
        alert('Listing URL copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(qrData.listingUrl);
      alert('Listing URL copied to clipboard!');
    }
  };

  const clearAllQRCodes = () => {
    setQrCodes({});
    alert('All QR codes cleared. Generate fresh ones!');
  };

  const getGovtIdTypeName = (type) => {
    switch(type) {
      case 'aadhar': return 'Aadhar Card';
      case 'pan_card': return 'PAN Card';
      case 'passport': return 'Passport';
      case 'driving_license': return 'Driving License';
      case 'voter_id': return 'Voter ID';
      case 'other': return 'Other ID';
      default: return type || 'Not specified';
    }
  };

  if (!currentUser) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={styles.dashboard}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <h1 style={styles.logoTitle}>ShelterSeek</h1>
          <p style={styles.logoSubtitle}>Host Dashboard</p>
        </div>
        <nav style={styles.navLinks}>
          <button
            type="button"
            onClick={() => navigate('/host_index')}
            style={styles.navLink}
          >
            <FontAwesomeIcon icon={faArrowLeft} style={styles.navLinkIcon} /> Back
          </button>
          
          <button type="button" onClick={() => handleSectionChange('overview')} style={{ ...styles.navLink, ...(activeSection === 'overview' ? styles.navLinkActive : {}) }}>
            <FontAwesomeIcon icon={faHome} style={styles.navLinkIcon} /> Overview
          </button>
          <button type="button" onClick={() => handleSectionChange('bookings')} style={{ ...styles.navLink, ...(activeSection === 'bookings' ? styles.navLinkActive : {}) }}>
            <FontAwesomeIcon icon={faCalendar} style={styles.navLinkIcon} /> Bookings
          </button>
          <button type="button" onClick={() => handleSectionChange('earnings')} style={{ ...styles.navLink, ...(activeSection === 'earnings' ? styles.navLinkActive : {}) }}>
            <FontAwesomeIcon icon={faDollarSign} style={styles.navLinkIcon} /> Earnings
          </button>
          <button type="button" onClick={() => handleSectionChange('qr-codes')} style={{ ...styles.navLink, ...(activeSection === 'qr-codes' ? styles.navLinkActive : {}) }}>
            <FontAwesomeIcon icon={faImages} style={styles.navLinkIcon} /> QR Codes
          </button>
          {/* Updated Logout Button */}
          <button type="button" onClick={handleLogout} style={styles.navLink}>
            <FontAwesomeIcon icon={faSignOutAlt} style={styles.navLinkIcon} /> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {activeSection === 'overview' ? 'Overview' :
             activeSection === 'bookings' ? 'Bookings' :
             activeSection === 'earnings' ? 'Earnings' :
             activeSection === 'qr-codes' ? 'QR Codes' : 'Overview'}
          </h2>
          
          {/* Refresh Button with Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: pollingInterval ? '#10b981' : '#ef4444',
                animation: pollingInterval ? 'pulse 1s infinite' : 'none'
              }} />
              <span style={{ fontSize: '0.875rem', color: pollingInterval ? '#059669' : '#6b7280' }}>
                {pollingInterval ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </span>
            </div>
            
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isRefreshing ? '#6b7280' : '#d72d6e',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: isRefreshing ? 0.7 : 1
              }}
            >
              <FontAwesomeIcon icon={faSyncAlt} spin={isRefreshing} /> 
              {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        </div>

        {/* Auto-refresh status indicator */}
        {lastUpdate && (
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Auto-updating every second • Last update: {lastUpdate.toLocaleTimeString()}</span>
            {lastManualRefresh && (
              <span style={{ marginLeft: 'auto', color: '#d72d6e' }}>
                Manual refresh: {lastManualRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
        )}

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <>
            <div style={styles.listingsSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={styles.sectionTitle}>Your Listings</h3>
                <button
                  onClick={() => setShowFilter(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#d72d6e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FontAwesomeIcon icon={faFilter} /> Filter
                </button>
              </div>

              <div style={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search by title or location..."
                  style={styles.searchBar}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div style={styles.listingsContainer}>
                {filteredListings.length === 0 ? (
                  <p>No listings found. Create your first listing!</p>
                ) : (
                  filteredListings.map((listing) => {
                    const suggestions = generateSuggestions(listing);
                    let statusStyle = { ...styles.listingStatusBase };
                    if (listing.status === 'active') statusStyle = { ...statusStyle, ...styles.listingStatusActive };
                    else if (listing.status === 'inactive') statusStyle = { ...statusStyle, ...styles.listingStatusInactive };
                    else if (listing.status === 'pending') statusStyle = { ...statusStyle, ...styles.listingStatusPending };
                    else if (listing.status === 'verified') statusStyle = { ...statusStyle, ...styles.listingStatusVerified };
                    else if (listing.status === 'rejected') statusStyle = { ...statusStyle, ...styles.listingStatusRejected };

                    return (
                      <div key={listing._id} style={styles.listingCard}>
                        <div style={styles.listingHeader}>
                          <h4 style={styles.listingCardTitle}>{listing.title}</h4>
                          <div style={statusStyle}>{listing.status}</div>
                        </div>

                        <div style={styles.listingDetails}>
                          <p><strong>Description:</strong> {listing.description}</p>
                          <p><strong>Price:</strong> ₹{listing.price}</p>
                          <p><strong>Location:</strong> {listing.location}</p>
                          <p><strong>Coordinates:</strong> ({listing.coordinates?.lat || 'N/A'}, {listing.coordinates?.lng || 'N/A'})</p>
                          <p><strong>Max Days Allowed:</strong> {listing.maxdays}</p>
                          <p><strong>Property Type:</strong> {listing.propertyType}</p>
                          <p><strong>Capacity:</strong> {listing.capacity}</p>
                          <p><strong>Room Type:</strong> {listing.roomType}</p>
                          <p><strong>Bedrooms:</strong> {listing.bedrooms}</p>
                          <p><strong>Beds:</strong> {listing.beds}</p>
                          <p><strong>Room Size:</strong> {listing.roomSize}</p>
                          <p><strong>Room Location:</strong> {listing.roomLocation || 'Not specified'}</p>
                          <p><strong>Transport Distance:</strong> {listing.transportDistance || 'Not specified'}</p>
                          <p><strong>Host Gender:</strong> {listing.hostGender || 'Not specified'}</p>
                          <p><strong>Food Facility:</strong> {listing.foodFacility || 'Not specified'}</p>
                          <p><strong>Amenities:</strong> {listing.amenities?.join(', ') || 'None'}</p>
                          <p><strong>Discount:</strong> {listing.discount || 0}%</p>
                          <p><strong>Likes:</strong> {listing.likes || 0}</p>
                          <p><strong>Status:</strong> {listing.status}</p>
                          <p><strong>Booking Available:</strong> {listing.booking ? 'Yes' : 'No'}</p>
                          <p><strong>Reviews:</strong> {listing.reviews?.join(', ') || 'None'}</p>
                          <p><strong>Unavailable Days:</strong> {listing.unavailableDates && listing.unavailableDates.length > 0 ? listing.unavailableDates.join(', ') : 'None'}</p>
                          <p><strong>Created At:</strong> {formatDate(listing.createdAt)}</p>
                        </div>

                        <div style={suggestions.length > 0 ? styles.suggestionsSimple : styles.suggestionsSimpleSuccess}>
                          <strong style={suggestions.length > 0 ? styles.suggestionsStrong : styles.suggestionsStrongSuccess}>
                            Suggestions:
                          </strong>
                          {suggestions.length > 0 ? (
                            <ul style={styles.suggestionsList}>
                              {suggestions.map((s, i) => (
                                <li key={i} style={styles.suggestionsListItem}>
                                  <FontAwesomeIcon icon={s.icon} /> {s.message}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ marginTop: '0.5rem' }}>Your listing looks great!</p>
                          )}
                        </div>

                        {listing.images && listing.images.length > 0 && (
                          <div style={styles.imagesContainer}>
                            <strong>Images:</strong>
                            <div style={styles.imageGallery}>
                              {listing.images.map((imgId, idx) => (
                                <img key={idx} src={`${API_BASE_URL}/api/images/${imgId}`} alt="Listing" style={styles.listingImage} />
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={styles.listingActions}>
                          <button type="button" style={styles.updateListingBtn} onClick={() => handleUpdate(listing._id)}>
                            <FontAwesomeIcon icon={faEdit} /> Update
                          </button>
                          <button type="button" style={styles.deleteListingBtn} onClick={() => handleDelete(listing._id)}>
                            <FontAwesomeIcon icon={faTrash} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Real-time Bookings Section with Special Requests */}
            <div style={{ 
              marginTop: '2rem', 
              backgroundColor: 'white', 
              borderRadius: '0.5rem', 
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
              padding: '1.5rem' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                    Real-time Bookings
                    <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: '#6b7280' }}>
                      (Auto-updates every second)
                    </span>
                  </h3>
                  {lastUpdate && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                      Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: pollingInterval ? '#10b981' : '#ef4444',
                    animation: pollingInterval ? 'pulse 1s infinite' : 'none'
                  }} />
                  <span style={{ fontSize: '0.875rem', color: pollingInterval ? '#059669' : '#6b7280' }}>
                    {pollingInterval ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>

              {realTimeBookings.length === 0 ? (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: '#6b7280',
                  border: '2px dashed #e5e7eb',
                  borderRadius: '0.5rem'
                }}>
                  <p style={{ marginBottom: '0.5rem' }}>No bookings yet</p>
                  <p style={{ fontSize: '0.875rem' }}>New bookings will appear here in real-time</p>
                </div>
              ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {realTimeBookings.slice(0, 10).map((booking, index) => {
                    const isExpanded = expandedBookingId === (booking._id || booking.bookingId);
                    const hasSpecialRequests = booking.specialRequests && booking.specialRequests.trim() !== '';
                    const hasGuestDetails = booking.guestDetails && booking.guestDetails.length > 0;
                    
                    return (
                      <div 
                        key={booking._id || booking.bookingId} 
                        style={{ 
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          marginBottom: '1rem',
                          backgroundColor: index === 0 && isRecentBooking(booking) ? '#f0fdf4' : 'white',
                          transition: 'all 0.3s'
                        }}
                      >
                        <div 
                          style={{ 
                            padding: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onClick={() => toggleBookingDetails(booking._id || booking.bookingId)}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <FontAwesomeIcon icon={faUserFriends} style={{ color: '#d72d6e' }} />
                              <strong style={{ fontSize: '1rem' }}>{booking.travelerName || 'Guest'}</strong>
                              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                ({booking.travelerEmail})
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                              <div>
                                <strong>Room:</strong> {booking.roomTitle || 'Room'}
                              </div>
                              <div>
                                <strong>Dates:</strong> {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                              </div>
                              <div>
                                <strong>Guests:</strong> {booking.guests || 1}
                              </div>
                              <div style={{ fontWeight: 600, color: '#d72d6e' }}>
                                ₹{booking.totalCost?.toLocaleString() || '0'}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: getStatusColor(booking.bookingStatus).bg,
                              color: getStatusColor(booking.bookingStatus).text
                            }}>
                              {booking.bookingStatus || 'pending'}
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {formatBookingTime(booking.bookedAt)}
                            </span>
                            <FontAwesomeIcon 
                              icon={faInfoCircle} 
                              style={{ 
                                color: '#6b7280',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s'
                              }} 
                            />
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div style={{ 
                            padding: '1rem', 
                            borderTop: '1px solid #e5e7eb',
                            backgroundColor: '#f9fafb',
                            borderRadius: '0 0 0.5rem 0.5rem'
                          }}>
                            {/* Guest Details Section */}
                            {hasGuestDetails && (
                              <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <FontAwesomeIcon icon={faUserFriends} /> Guest Details
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                  {booking.guestDetails.map((guest, idx) => (
                                    <div key={idx} style={{ 
                                      backgroundColor: 'white', 
                                      padding: '1rem', 
                                      borderRadius: '0.375rem',
                                      border: '1px solid #e5e7eb'
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <strong style={{ color: '#d72d6e' }}>
                                          Guest {idx + 1} {idx === 0 && '(Primary)'}
                                        </strong>
                                        <span style={{ 
                                          fontSize: '0.75rem', 
                                          padding: '0.125rem 0.375rem',
                                          backgroundColor: '#e0e7ff',
                                          color: '#3730a3',
                                          borderRadius: '0.25rem'
                                        }}>
                                          {guest.guestGender || 'Not specified'}
                                        </span>
                                      </div>
                                      
                                      <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                                        <div style={{ marginBottom: '0.25rem' }}>
                                          <strong>Name:</strong> {guest.guestName || 'Not provided'}
                                        </div>
                                        {guest.guestAge && (
                                          <div style={{ marginBottom: '0.25rem' }}>
                                            <strong>Age:</strong> {guest.guestAge}
                                          </div>
                                        )}
                                        {guest.guestContact && (
                                          <div style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FontAwesomeIcon icon={faEnvelope} size="xs" />
                                            <strong>Contact:</strong> {guest.guestContact}
                                          </div>
                                        )}
                                        {guest.govtIdType && guest.govtIdNumber && (
                                          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #e5e7eb' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                              <FontAwesomeIcon icon={faIdCard} size="xs" />
                                              <strong>ID:</strong> {getGovtIdTypeName(guest.govtIdType)}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                                              {guest.govtIdNumber}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Special Requests Section */}
                            {hasSpecialRequests && (
                              <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <FontAwesomeIcon icon={faComment} /> Special Requests
                                </h4>
                                <div style={{ 
                                  backgroundColor: 'white', 
                                  padding: '1rem', 
                                  borderRadius: '0.375rem',
                                  border: '1px solid #e5e7eb',
                                  fontStyle: 'italic',
                                  color: '#374151',
                                  fontSize: '0.875rem',
                                  lineHeight: 1.6
                                }}>
                                  "{booking.specialRequests}"
                                </div>
                              </div>
                            )}

                            {/* Payment & Booking Details */}
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                              gap: '1rem',
                              marginTop: '1rem'
                            }}>
                              <div style={{ fontSize: '0.875rem' }}>
                                <strong style={{ color: '#6b7280' }}>Transaction ID:</strong>
                                <div style={{ color: '#374151', fontFamily: 'monospace' }}>
                                  {booking.paymentDetails?.transactionId || 'N/A'}
                                </div>
                              </div>
                              <div style={{ fontSize: '0.875rem' }}>
                                <strong style={{ color: '#6b7280' }}>Payment Method:</strong>
                                <div style={{ color: '#374151' }}>
                                  {booking.paymentDetails?.paymentMethod || 'N/A'}
                                </div>
                              </div>
                              <div style={{ fontSize: '0.875rem' }}>
                                <strong style={{ color: '#6b7280' }}>Booking ID:</strong>
                                <div style={{ color: '#374151' }}>
                                  {booking.bookingId || booking._id || 'N/A'}
                                </div>
                              </div>
                              <div style={{ fontSize: '0.875rem' }}>
                                <strong style={{ color: '#6b7280' }}>Booked At:</strong>
                                <div style={{ color: '#374151' }}>
                                  {booking.bookedAt ? new Date(booking.bookedAt).toLocaleString() : 'N/A'}
                                </div>
                              </div>
                            </div>

                            {/* Contact Traveler Button */}
                            {booking.travelerEmail && (
                            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                              <button
                                onClick={() => navigate('/chat', { 
                                  state: {
                                    startChatWith: {
                                      email: booking.travelerEmail,
                                      name: booking.travelerName || 'Traveler',
                                      profilePhoto: null, // You can add traveler profile photo if available
                                      bookingId: booking.bookingId || booking._id
                                    }
                                  }
                                })}
                                style={{
                                  padding: '0.5rem 1.5rem',
                                  backgroundColor: '#d72d6e',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.375rem',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}
                              >
                                <FontAwesomeIcon icon={faEnvelope} />
                                Contact Traveler
                              </button>
                            </div>
                          )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {realTimeBookings.length > 10 && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                      Showing 10 of {realTimeBookings.length} bookings
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Bookings Section */}
        {activeSection === 'bookings' && (
          <div style={{ marginTop: '2rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>Bookings Analytics</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: pollingInterval ? '#10b981' : '#ef4444'
                }} />
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Auto-refreshing every 30s
                </span>
              </div>
            </div>
            {analytics ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>{analytics.totalBookings}</h4>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Bookings</p>
                  </div>
                  <div style={{ backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>₹{analytics.avgEarningsPerBooking.toFixed(0)}</h4>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Avg. per Booking</p>
                  </div>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>Monthly Bookings</h4>
                <div style={{ height: '300px', marginBottom: '2rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem'
                        }}
                      />
                      <Bar
                        dataKey="bookings"
                        fill="#d72d6e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>Bookings vs Earnings Overview</h4>
                <div style={{ height: '350px', marginBottom: '1rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        yAxisId="left"
                        fontSize={12}
                        orientation="left"
                      />
                      <YAxis
                        yAxisId="right"
                        fontSize={12}
                        orientation="right"
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem'
                        }}
                        formatter={(value, name) => {
                          if (name === 'earnings') {
                            return [`₹${value.toLocaleString()}`, 'Earnings'];
                          }
                          return [value, 'Bookings'];
                        }}
                      />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="bookings"
                        fill="#d72d6e"
                        name="Bookings"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="earnings"
                        fill="#059669"
                        name="Earnings"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading bookings data...</p>
            )}
          </div>
        )}

        {/* Earnings Section */}
        {activeSection === 'earnings' && (
          <div style={{ marginTop: '2rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginBottom: '1.5rem' }}>Earnings Analytics</h3>
            {analytics ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>₹{analytics.totalEarnings.toLocaleString()}</h4>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Earnings</p>
                  </div>
                  <div style={{ backgroundColor: '#e0e7ff', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3730a3' }}>₹{analytics.avgEarningsPerBooking.toFixed(0)}</h4>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Avg. per Booking</p>
                  </div>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>Monthly Earnings</h4>
                <div style={{ height: '300px', marginBottom: '1rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        fontSize={12}
                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem'
                        }}
                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Earnings']}
                      />
                      <Bar
                        dataKey="earnings"
                        fill="#059669"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading earnings data...</p>
            )}
          </div>
        )}

        {/* QR Codes Section */}
        {activeSection === 'qr-codes' && (
          <div style={{ marginTop: '2rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>Listing QR Codes</h3>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  Generate QR codes for your listings. When scanned, users will be taken directly to your listing page.
                </p>
              </div>
              <button
                onClick={clearAllQRCodes}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Clear All QR Codes
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {listings.map((listing) => (
                <div key={listing._id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{listing.title}</h4>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>{listing.location}</p>

                  {qrCodes[listing._id] ? (
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={qrCodes[listing._id].qrCode}
                        alt="QR Code"
                        style={{ width: '150px', height: '150px', marginBottom: '1rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => downloadQRCode(listing._id, listing.title)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#d72d6e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          <FontAwesomeIcon icon={faImages} style={{ marginRight: '0.5rem' }} />
                          Download
                        </button>
                        <button
                          onClick={() => shareQRCode(listing._id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          <FontAwesomeIcon icon={faImages} style={{ marginRight: '0.5rem' }} />
                          Share
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => generateQRCode(listing._id)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: '1px dashed #d1d5db',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        ':hover': {
                          backgroundColor: '#e5e7eb',
                          borderColor: '#9ca3af'
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={faImages} style={{ marginRight: '0.5rem' }} />
                      Generate QR Code
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Menu */}
        {showFilter && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2.5rem', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
              <button onClick={() => setShowFilter(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#666' }}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <h3 style={{ textAlign: 'center', color: '#d72d6e', fontSize: '1.8rem', marginBottom: '2rem' }}>Filter Your Listings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <input type="text" placeholder="Title" value={filters.title} onChange={e => setFilters(prev => ({ ...prev, title: e.target.value }))} style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                <input type="text" placeholder="Location" value={filters.location} onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))} style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                <input type="number" placeholder="Min Price" value={filters.minPrice} onChange={e => setFilters(prev => ({ ...prev, minPrice: e.target.value }))} style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                <input type="number" placeholder="Max Price" value={filters.maxPrice} onChange={e => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))} style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                <select value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))} style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select value={filters.propertyType} onChange={e => setFilters(prev => ({ ...prev, propertyType: e.target.value }))} style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="">Any Property Type</option>
                  <option>PG</option><option>House</option><option>Villa</option><option>Apartment</option><option>Cottage</option>
                </select>
                <select value={filters.roomType} onChange={e => setFilters(prev => ({ ...prev, roomType: e.target.value }))} style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="">Any Room Type</option>
                  <option>Any</option><option>Shared</option><option>Full</option>
                </select>
                <select value={filters.hostGender} onChange={e => setFilters(prev => ({ ...prev, hostGender: e.target.value }))} style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="">Any Host Gender</option>
                  <option>Male</option><option>Female</option>
                </select>
                <select value={filters.foodFacility} onChange={e => setFilters(prev => ({ ...prev, foodFacility: e.target.value }))} style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="">Any Food Facility</option>
                  <option>Not Available</option><option>Vegetarian</option><option>Non-Vegetarian</option><option>Both</option>
                </select>
                <select value={filters.roomSize} onChange={e => setFilters(prev => ({ ...prev, roomSize: e.target.value }))} style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="">Any Room Size</option>
                  <option>Small</option><option>Medium</option><option>Large</option>
                </select>
                <input type="number" placeholder="Min Capacity" value={filters.capacity} onChange={e => setFilters(prev => ({ ...prev, capacity: e.target.value }))} style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                <input type="number" placeholder="Min Bedrooms" value={filters.bedrooms} onChange={e => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))} style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                <input type="number" placeholder="Min Beds" value={filters.beds} onChange={e => setFilters(prev => ({ ...prev, beds: e.target.value }))} style={{ padding: '0.9rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button onClick={() => { setFilters({ title: '', location: '', minPrice: '', maxPrice: '', status: 'all', propertyType: '', roomType: '', hostGender: '', foodFacility: '', roomSize: '', capacity: '', bedrooms: '', beds: '' }); setShowFilter(false); }} style={{ marginRight: '1rem', padding: '0.9rem 2rem', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  Clear All
                </button>
                <button onClick={() => setShowFilter(false)} style={{ padding: '0.9rem 2rem', backgroundColor: '#d72d6e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default HostDashboard;