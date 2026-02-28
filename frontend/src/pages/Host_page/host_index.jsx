import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './host_index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import Footer from '../../components/Footer/Footer';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapUpdater = ({ latitude, longitude, setFormData }) => {
  const map = useMap();
  const handleMapClick = useCallback((e) => {
    const lat = e.latlng.lat.toFixed(5);
    const lng = e.latlng.lng.toFixed(5);
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  }, [setFormData]);

  useEffect(() => {
    if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
      map.setView([parseFloat(latitude), parseFloat(longitude)], 13);
    }
  }, [latitude, longitude, map]);

  useEffect(() => {
    map.on('click', handleMapClick);
    return () => map.off('click', handleMapClick);
  }, [map, handleMapClick]);

  return null;
};

// PERFECT CALENDAR – NO DATE BUGS, NO AUTO SUBMIT
const UnavailableDatesCalendar = ({ selectedDates = [], onDatesChange, minDate, maxDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get YYYY-MM-DD in LOCAL TIME (no timezone shift)
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedSet = new Set(selectedDates);

  const handleDateClick = (date) => {
    const dateStr = getLocalDateString(date);
    const newSet = new Set(selectedSet);
    if (newSet.has(dateStr)) {
      newSet.delete(dateStr);
    } else {
      newSet.add(dateStr);
    }
    onDatesChange(Array.from(newSet));
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1));

  const isSelected = (date) => date && selectedSet.has(getLocalDateString(date));
  const isInRange = (date) => date && date >= minDate && date <= maxDate;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
      border: '2px solid #ffebee',
      maxWidth: '420px',
      margin: '0 auto',
      fontFamily: 'inherit'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button type="button" onClick={prevMonth} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: '#e91e63' }}>‹</button>
        <h3 style={{ margin: 0, color: '#e91e63', fontWeight: '600' }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button type="button" onClick={nextMonth} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: '#e91e63' }}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '8px', textAlign: 'center', fontWeight: 'bold', color: '#e91e63', marginBottom: '10px' }}>
        {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '10px' }}>
        {days.map((date, i) => (
          <div key={i}>
            {date ? (
              <button
                type="button"
                onClick={() => isInRange(date) && handleDateClick(date)}
                disabled={!isInRange(date)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: isSelected(date) ? '#e91e63' : (isInRange(date) ? '#ffb6c1' : '#eee'),
                  background: isSelected(date) ? '#e91e63' : '#fff',
                  color: isSelected(date) ? '#fff' : (isInRange(date) ? '#333' : '#aaa'),
                  fontWeight: isSelected(date) ? 'bold' : '500',
                  cursor: isInRange(date) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  fontSize: '1rem'
                }}
              >
                {date.getDate()}
              </button>
            ) : <div style={{ height: '44px' }} />}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'center', color: '#e91e63', fontWeight: '600', fontSize: '0.95rem' }}>
        {selectedSet.size} unavailable date(s) selected
      </div>
    </div>
  );
};

const HostIndex = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', location: '', latitude: '', longitude: '',
    maxdays: '', propertyType: '', capacity: '', roomType: '', bedrooms: '', beds: '',
    roomSize: '', roomLocation: '', transportDistance: '', hostGender: '', foodFacility: '',
    amenities: [], discount: 0, unavailableDates: [],
  });

  const [existingImages, setExistingImages] = useState([]); // Array of image IDs from DB
  const [newImages, setNewImages] = useState([]); // Array of File objects
  const [removedImageIds, setRemovedImageIds] = useState([]); // Array of removed image IDs
  const [listingId, setListingId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const mediaInputRef = useRef(null);
  const uploadContainerRef = useRef(null);

  const slides = ['/images/photo1.jpg','/images/photo2.jpg','/images/photo3.jpg','/images/photo4.jpg'];
  const [currentSlide, setCurrentSlide] = useState(0);
  const API_BASE_URL = 'http://localhost:3001';

  // Enhanced logout function
  const handleLogout = () => {
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

  // Refresh function to reload listing data
  const handleRefresh = async () => {
    if (listingId) {
      setIsRefreshing(true);
      try {
        await fetchListing(listingId);
        setLastRefresh(new Date());
        console.log('Listing data refreshed successfully');
      } catch (error) {
        console.error('Refresh failed:', error);
        alert('Failed to refresh listing data');
      } finally {
        setIsRefreshing(false);
      }
    } else {
      // For new listing form, just reset form and show message
      setLastRefresh(new Date());
      alert('Form refreshed. Ready for new listing.');
    }
  };

  // Auto-refresh every 30 seconds if editing a listing
  useEffect(() => {
    let interval;
    if (listingId) {
      interval = setInterval(() => {
        console.log('Auto-refreshing listing data...');
        fetchListing(listingId);
      }, 30000); 
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [listingId]);

  const getCurrentUser = () => {
    const user = localStorage.getItem('user') || sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('listingId');
    if (id) { 
      setListingId(id); 
      fetchListing(id); 
    }
  }, []);

  useEffect(() => {
    if (!listingId && !formData.latitude && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(5),
          longitude: pos.coords.longitude.toFixed(5)
        }));
      });
    }
  }, [listingId, formData.latitude]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const fetchListing = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/rooms/listings/${id}`);
      const l = res.data.data.listing;
      
      setFormData({
        title: l.title || '', 
        description: l.description || '', 
        price: l.price || '',
        location: l.location || '', 
        latitude: l.coordinates?.lat || '', 
        longitude: l.coordinates?.lng || '',
        maxdays: l.maxdays || '', 
        propertyType: l.propertyType || '', 
        capacity: l.capacity || '',
        roomType: l.roomType || '', 
        bedrooms: l.bedrooms || '', 
        beds: l.beds || '',
        roomSize: l.roomSize || '', 
        roomLocation: l.roomLocation || '',
        transportDistance: l.transportDistance || '', 
        hostGender: l.hostGender || '',
        foodFacility: l.foodFacility || '', 
        amenities: l.amenities || [], 
        discount: l.discount || 0,
        unavailableDates: l.unavailableDates
          ? l.unavailableDates.map(d => {
              const date = new Date(d);
              return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            })
          : [],
      });
      
      // Set existing images
      setExistingImages(l.images || []);
      
    } catch (err) { 
      console.error('Error fetching listing:', err); 
      alert('Failed to load listing data');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        amenities: checked ? [...prev.amenities, value] : prev.amenities.filter(a => a !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUnavailableChange = (dates) => {
    setFormData(prev => ({ ...prev, unavailableDates: dates }));
  };

  // Remove existing image (from DB)
  const handleRemoveExistingImage = (imageId) => {
    setRemovedImageIds(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(id => id !== imageId));
  };

  // Remove new image (not yet uploaded)
  const handleRemoveNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle new image upload
  const handleMediaUpload = (files) => {
    const filesArray = Array.from(files);
    setNewImages(prev => [...prev, ...filesArray]);
  };

  // Drag and drop handlers
  useEffect(() => {
    const container = uploadContainerRef.current;
    if (!container) return;
    
    const handleDragOver = (e) => { 
      e.preventDefault(); 
      container.classList.add('dragover'); 
    };
    
    const handleDragLeave = (e) => { 
      e.preventDefault(); 
      container.classList.remove('dragover'); 
    };
    
    const handleDrop = (e) => { 
      e.preventDefault(); 
      container.classList.remove('dragover'); 
      handleMediaUpload(e.dataTransfer.files); 
    };
    
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('drop', handleDrop);
    
    return () => {
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('dragleave', handleDragLeave);
      container.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const user = getCurrentUser();
    if (!user) { 
      alert('Please login first'); 
      setIsSubmitting(false); 
      return; 
    }

    const data = new FormData();
    data.append('currentUser', JSON.stringify(user));

    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (key === 'amenities') {
        data.append(key, formData.amenities.join(','));
      } else if (key === 'unavailableDates') {
        data.append('unavailableDates', JSON.stringify(formData.unavailableDates));
      } else {
        data.append(key, formData[key] || '');
      }
    });

    // Add existing images (those not removed)
    const remainingExistingImages = existingImages.filter(id => !removedImageIds.includes(id));
    data.append('existingImages', JSON.stringify(remainingExistingImages));
    
    // Add removed images
    if (removedImageIds.length > 0) {
      data.append('removedImages', removedImageIds.join(','));
    }

    // Add new image files
    newImages.forEach(file => {
      data.append('images', file);
    });

    try {
      const url = listingId 
        ? `${API_BASE_URL}/api/rooms/listings/${listingId}` 
        : `${API_BASE_URL}/api/rooms/listings`;
      
      const method = listingId ? 'put' : 'post';
      
      const response = await axios({
        method,
        url,
        data,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        alert(listingId ? 'Listing updated successfully!' : 'Listing created successfully!');
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert(err.response?.data?.message || 'Failed to save listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 3);

  return (
    <>
      <div className="host-top-navbar">
        <div className="host-logo"><h2>ShelterSeek</h2></div>
        
        {/* Refresh Button in Navbar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginLeft: 'auto',
          marginRight: '1rem'
        }}>
          {listingId && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isRefreshing ? '#6b7280' : '#e91e63',
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
              title="Refresh listing data"
            >
              <FontAwesomeIcon icon={faSyncAlt} spin={isRefreshing} /> 
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#333',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#d72d6e')}
            onMouseLeave={(e) => (e.target.style.color = '#333')}
          >
            <FontAwesomeIcon icon={faUser} />
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="host-user-menu host-open">
            <button className="host-user-close-btn" onClick={() => setIsMenuOpen(false)}>×</button>
            <ul>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/chat">Chat</a></li>
              <li><button onClick={handleLogout} 
              style={{
                background: 'none',
                border: 'none',
                color: '#e91e63',
                fontSize: '1rem',
                cursor: 'pointer',
                padding: 0,
                transition: 'color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginLeft: '3rem'
              }}
              >Logout</button></li>
            </ul>
          </div>
        )}
      </div>

      <div className="container">
        <div className="slider-container">
          <div className="slider">
            {slides.map((s,i) => (
              <div 
                key={i} 
                className={`slide ${i===currentSlide?'active':''}`} 
                style={{backgroundImage:`url(${s})`}} 
              />
            ))}
          </div>
          <div className="text-section">
            <h1>Welcome to ShelterSeek</h1>
            <p>Find and list safe and affordable stays for travelers.</p>
            <button 
              type="button" 
              className="get-started-btn" 
              onClick={() => document.querySelector('.form-container')?.scrollIntoView({behavior:'smooth'})}
            >
              Get Started
            </button>
          </div>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <h2>{listingId ? 'Edit Listing' : 'Create Listing'}</h2>
              
              {/* Refresh Status Indicator */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                {listingId && (
                  <>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      animation: 'pulse 2s infinite'
                    }} />
                    <span>Auto-refreshing every 30s</span>
                    {lastRefresh && (
                      <span style={{ 
                        marginLeft: '0.5rem', 
                        color: '#e91e63',
                        fontSize: '0.8rem'
                      }}>
                        Last refresh: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price per Night</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Maximum Stay (days)</label>
                <input 
                  type="number" 
                  name="maxdays" 
                  value={formData.maxdays} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location (Address)</label>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Latitude</label>
                <input 
                  type="number" 
                  step="0.00001" 
                  name="latitude" 
                  value={formData.latitude} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input 
                  type="number" 
                  step="0.00001" 
                  name="longitude" 
                  value={formData.longitude} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Property Type</label>
              <select 
                name="propertyType" 
                value={formData.propertyType} 
                onChange={handleChange} 
                required
              >
                <option value="">Select</option>
                {['PG','House','Resort','Villa','Duplex','Cottage','Apartment','Hostel','Farm House','Other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Capacity</label>
                <input 
                  type="number" 
                  name="capacity" 
                  value={formData.capacity} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Room Type</label>
                <select 
                  name="roomType" 
                  value={formData.roomType} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select</option>
                  <option>Any</option>
                  <option>Shared</option>
                  <option>Full</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bedrooms</label>
                <input 
                  type="number" 
                  name="bedrooms" 
                  value={formData.bedrooms} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Beds</label>
                <input 
                  type="number" 
                  name="beds" 
                  value={formData.beds} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Room Size</label>
              <select 
                name="roomSize" 
                value={formData.roomSize} 
                onChange={handleChange} 
                required
              >
                <option value="">Select</option>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </div>

            <div className="form-group">
              <label>Room Location</label>
              <div className="radio-group">
                {['In Town','Outside of Town','Nearby Villages','Residential Area','Commercial Area','Near Highway','Country Side'].map(o => (
                  <label key={o}>
                    <input 
                      type="radio" 
                      name="roomLocation" 
                      value={o} 
                      checked={formData.roomLocation===o} 
                      onChange={handleChange} 
                    /> 
                    {o}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Near Transport</label>
              <div className="radio-group">
                {['Within 2km','Within 5km','Within 10km'].map(o => (
                  <label key={o}>
                    <input 
                      type="radio" 
                      name="transportDistance" 
                      value={o} 
                      checked={formData.transportDistance===o} 
                      onChange={handleChange} 
                    /> 
                    {o}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Host Gender</label>
              <div className="radio-group">
                {['Male','Female'].map(g => (
                  <label key={g}>
                    <input 
                      type="radio" 
                      name="hostGender" 
                      value={g} 
                      checked={formData.hostGender===g} 
                      onChange={handleChange} 
                    /> 
                    {g}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Food Facility</label>
              <div className="radio-group">
                {['Not Available','Vegetarian','Non-Vegetarian','Both'].map(f => (
                  <label key={f}>
                    <input 
                      type="radio" 
                      name="foodFacility" 
                      value={f} 
                      checked={formData.foodFacility===f} 
                      onChange={handleChange} 
                    /> 
                    {f}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Amenities</label>
              <div className="checkbox-group">
                {['WiFi','Air Conditioning','Laundry','Hot Water','Lift','Free Car Parking','EV Charging'].map(a => (
                  <label key={a}>
                    <input 
                      type="checkbox" 
                      value={a} 
                      checked={formData.amenities.includes(a)} 
                      onChange={handleChange} 
                    /> 
                    {a}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Discount (%)</label>
              <input 
                type="range" 
                name="discount" 
                min="0" 
                max="100" 
                value={formData.discount} 
                onChange={handleChange} 
              />
              <span>{formData.discount}%</span>
            </div>

            {/* IMAGE UPLOAD SECTION - FIXED */}
            <div className="form-group">
              <label>Upload Photos & Videos</label>
              
              {/* Existing Images from Database */}
              {existingImages.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#e91e63', marginBottom: '0.75rem' }}>
                    Existing Images ({existingImages.length})
                  </h4>
                  <div className="image-preview">
                    {existingImages.map((imgId) => (
                      <div key={imgId} className="preview-item">
                        <img
                          src={`${API_BASE_URL}/api/images/${imgId}`}
                          alt="Existing"
                          className="preview-image"
                        />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => handleRemoveExistingImage(imgId)}
                          title="Remove this image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images to Upload */}
              {newImages.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#e91e63', marginBottom: '0.75rem' }}>
                    New Images to Upload ({newImages.length})
                  </h4>
                  <div className="image-preview">
                    {newImages.map((file, index) => (
                      <div key={index} className="preview-item">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="New"
                          className="preview-image"
                        />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => handleRemoveNewImage(index)}
                          title="Remove this image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div className="upload-container" ref={uploadContainerRef}>
                <div className="upload-area">
                  <span className="home-icon">🏠</span>
                  <div className="upload-text">
                    <label htmlFor="media" className="upload-label">
                      Upload files
                      <input
                        type="file"
                        id="media"
                        multiple
                        accept="image/*,video/*"
                        className="file-input"
                        ref={mediaInputRef}
                        onChange={e => handleMediaUpload(e.target.files)}
                      />
                    </label>
                    <span>or drag and drop</span>
                  </div>
                  <p className="upload-hint">PNG, JPG, GIF, MP4 up to 50MB</p>
                  <p className="upload-hint" style={{ color: '#e91e63', fontWeight: 'bold' }}>
                    Total Images: {existingImages.length + newImages.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Host Unavailable Dates</label>
              <p style={{fontSize:'14px',color:'#666',marginBottom:'10px'}}>
                Click dates when you are <strong>not available</strong> to host (next 3 months)
              </p>
              <UnavailableDatesCalendar
                selectedDates={formData.unavailableDates}
                onDatesChange={handleUnavailableChange}
                minDate={today}
                maxDate={maxDate}
              />
            </div>

            <div className="form-group">
              <label>Location Map (Click to set)</label>
              {formData.latitude && formData.longitude ? (
                <MapContainer 
                  center={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} 
                  zoom={13} 
                  style={{height:'400px',borderRadius:'12px'}}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} />
                  <MapUpdater 
                    latitude={formData.latitude} 
                    longitude={formData.longitude} 
                    setFormData={setFormData} 
                  />
                </MapContainer>
              ) : (
                <MapContainer 
                  center={[20.5937,78.9629]} 
                  zoom={5} 
                  style={{height:'400px',borderRadius:'12px'}}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapUpdater setFormData={setFormData} />
                </MapContainer>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '2rem',
              gap: '1rem'
            }}>
              <button 
                type="button" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isRefreshing ? '#6b7280' : '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
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
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </button>
              
              <button type="submit" className="submit-button" disabled={isSubmitting || isRefreshing}>
                {isSubmitting ? 'Saving...' : (listingId ? 'Update Listing' : 'Submit Listing')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
      
      {/* Add pulse animation CSS */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </>
  );
};

export default HostIndex;