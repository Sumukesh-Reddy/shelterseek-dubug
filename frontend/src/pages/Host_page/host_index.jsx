import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './host_index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faSyncAlt, faHome, faMapMarkerAlt, faBed, 
  faUtensils, faWifi, faParking, faSnowflake, faTshirt,
  faCar, faChargingStation, faArrowLeft, faArrowRight,
  faCheck, faSave, faImages, faCalendarAlt, faTag,
  faRuler, faVenusMars, faBus, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
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

// Calendar Component - Fixed with unique keys
const UnavailableDatesCalendar = ({ selectedDates = [], onDatesChange, minDate, maxDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  // Day names with unique keys
  const dayNames = [
    { key: 'sun', label: 'S' },
    { key: 'mon', label: 'M' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'W' },
    { key: 'thu', label: 'T' },
    { key: 'fri', label: 'F' },
    { key: 'sat', label: 'S' }
  ];

  return (
    <div className="calendar-wrapper" style={{
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
        {dayNames.map(day => (
          <div key={day.key}>{day.label}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '10px' }}>
        {days.map((date, i) => (
          <div key={`day-${currentMonth.getMonth()}-${i}`}>
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
        {selectedSet.size} 📅 unavailable date(s) selected
      </div>
    </div>
  );
};

// Step Components
const Step1BasicInfo = ({ formData, handleChange, errors }) => (
  <div className="step-content">
    <h2 className="step-title">
      <span>🏠</span> Basic Information
    </h2>
    <div className="form-group">
      <label><FontAwesomeIcon icon={faHome} /> Title</label>
      <input 
        type="text" 
        name="title" 
        value={formData.title} 
        onChange={handleChange} 
        placeholder="e.g., Cozy Beachfront Villa"
        required 
        className={errors.title ? 'error' : ''}
      />
      {errors.title && <small className="error-message">{errors.title}</small>}
    </div>

    <div className="form-group">
      <label><FontAwesomeIcon icon={faInfoCircle} /> Description</label>
      <textarea 
        name="description" 
        value={formData.description} 
        onChange={handleChange} 
        placeholder="Describe your property in detail..."
        rows="4"
        required 
        className={errors.description ? 'error' : ''}
      />
      {errors.description && <small className="error-message">{errors.description}</small>}
    </div>

    <div className="form-row">
      <div className="form-group">
        <label>💰 Price per Night</label>
        <input 
          type="number" 
          name="price" 
          value={formData.price} 
          onChange={handleChange} 
          placeholder="₹"
          required 
        />
      </div>
      <div className="form-group">
        <label>📅 Maximum Stay (days)</label>
        <input 
          type="number" 
          name="maxdays" 
          value={formData.maxdays} 
          onChange={handleChange} 
          placeholder="e.g., 30"
          required 
        />
      </div>
    </div>
  </div>
);

const Step2Location = ({ formData, handleChange, setFormData, errors }) => {
  const propertyTypes = [
    { emoji: '🏠', name: 'PG' },
    { emoji: '🏡', name: 'House' },
    { emoji: '🏨', name: 'Resort' },
    { emoji: '🏰', name: 'Villa' },
    { emoji: '🏢', name: 'Duplex' },
    { emoji: '🏕️', name: 'Cottage' },
    { emoji: '🏙️', name: 'Apartment' },
    { emoji: '🏚️', name: 'Hostel' },
    { emoji: '🌾', name: 'Farm House' },
    { emoji: '🏛️', name: 'Other' }
  ];

  const roomLocations = [
    { emoji: '🏙️', name: 'In Town' },
    { emoji: '🌳', name: 'Outside of Town' },
    { emoji: '🏘️', name: 'Nearby Villages' },
    { emoji: '🏡', name: 'Residential Area' },
    { emoji: '🏢', name: 'Commercial Area' },
    { emoji: '🛣️', name: 'Near Highway' },
    { emoji: '🌄', name: 'Country Side' }
  ];

  return (
    <div className="step-content">
      <h2 className="step-title">
        <span>📍</span> Location & Property Type
      </h2>
      
      <div className="form-group">
        <label><FontAwesomeIcon icon={faMapMarkerAlt} /> Address</label>
        <input 
          type="text" 
          name="location" 
          value={formData.location} 
          onChange={handleChange} 
          placeholder="Full address"
          required 
          className={errors.location ? 'error' : ''}
        />
        {errors.location && <small className="error-message">{errors.location}</small>}
      </div>

      <div className="form-group">
        <label>🏷️ Property Type</label>
        <div className="options-grid">
          {propertyTypes.map(type => (
            <div
              key={type.name}
              className={`option-card ${formData.propertyType === type.name ? 'selected' : ''}`}
              onClick={() => handleChange({ target: { name: 'propertyType', value: type.name } })}
            >
              <div className="option-emoji">{type.emoji}</div>
              <div className="option-title">{type.name}</div>
            </div>
          ))}
        </div>
        {errors.propertyType && <small className="error-message">{errors.propertyType}</small>}
      </div>

      <div className="form-group">
        <label>📍 Room Location</label>
        <div className="options-grid">
          {roomLocations.map(loc => (
            <div
              key={loc.name}
              className={`option-card ${formData.roomLocation === loc.name ? 'selected' : ''}`}
              onClick={() => handleChange({ target: { name: 'roomLocation', value: loc.name } })}
            >
              <div className="option-emoji">{loc.emoji}</div>
              <div className="option-title">{loc.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>🌐 Latitude</label>
          <input 
            type="number" 
            step="0.00001" 
            name="latitude" 
            value={formData.latitude} 
            onChange={handleChange} 
            placeholder="e.g., 13.0827"
            required 
            className={errors.latitude ? 'error' : ''}
          />
          {errors.latitude && <small className="error-message">{errors.latitude}</small>}
        </div>
        <div className="form-group">
          <label>🌐 Longitude</label>
          <input 
            type="number" 
            step="0.00001" 
            name="longitude" 
            value={formData.longitude} 
            onChange={handleChange} 
            placeholder="e.g., 80.2707"
            required 
            className={errors.longitude ? 'error' : ''}
          />
          {errors.longitude && <small className="error-message">{errors.longitude}</small>}
        </div>
      </div>
    </div>
  );
};

const Step3RoomDetails = ({ formData, handleChange, errors }) => {
  const roomTypes = [
    { emoji: '🔄', name: 'Any' },
    { emoji: '👥', name: 'Shared' },
    { emoji: '🏠', name: 'Full' }
  ];

  const roomSizes = [
    { emoji: '📏', name: 'Small' },
    { emoji: '📐', name: 'Medium' },
    { emoji: '📏📏', name: 'Large' }
  ];

  const transportOptions = [
    { emoji: '🚶', name: 'Within 2km' },
    { emoji: '🚲', name: 'Within 5km' },
    { emoji: '🚗', name: 'Within 10km' }
  ];

  return (
    <div className="step-content">
      <h2 className="step-title">
        <span>🛏️</span> Room Details
      </h2>

      <div className="form-group">
        <label><FontAwesomeIcon icon={faBed} /> Room Type</label>
        <div className="options-grid">
          {roomTypes.map(type => (
            <div
              key={type.name}
              className={`option-card ${formData.roomType === type.name ? 'selected' : ''}`}
              onClick={() => handleChange({ target: { name: 'roomType', value: type.name } })}
            >
              <div className="option-emoji">{type.emoji}</div>
              <div className="option-title">{type.name}</div>
            </div>
          ))}
        </div>
        {errors.roomType && <small className="error-message">{errors.roomType}</small>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>👥 Capacity</label>
          <input 
            type="number" 
            name="capacity" 
            value={formData.capacity} 
            onChange={handleChange} 
            placeholder="Number of guests"
            required 
            className={errors.capacity ? 'error' : ''}
          />
          {errors.capacity && <small className="error-message">{errors.capacity}</small>}
        </div>
        <div className="form-group">
          <label>🛏️ Bedrooms</label>
          <input 
            type="number" 
            name="bedrooms" 
            value={formData.bedrooms} 
            onChange={handleChange} 
            placeholder="Number of bedrooms"
            required 
            className={errors.bedrooms ? 'error' : ''}
          />
          {errors.bedrooms && <small className="error-message">{errors.bedrooms}</small>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>🛌 Beds</label>
          <input 
            type="number" 
            name="beds" 
            value={formData.beds} 
            onChange={handleChange} 
            placeholder="Number of beds"
            required 
            className={errors.beds ? 'error' : ''}
          />
          {errors.beds && <small className="error-message">{errors.beds}</small>}
        </div>
        <div className="form-group">
          <label><FontAwesomeIcon icon={faRuler} /> Room Size</label>
          <div className="options-grid">
            {roomSizes.map(size => (
              <div
                key={size.name}
                className={`option-card ${formData.roomSize === size.name ? 'selected' : ''}`}
                onClick={() => handleChange({ target: { name: 'roomSize', value: size.name } })}
              >
                <div className="option-emoji">{size.emoji}</div>
                <div className="option-title">{size.name}</div>
              </div>
            ))}
          </div>
          {errors.roomSize && <small className="error-message">{errors.roomSize}</small>}
        </div>
      </div>

      <div className="form-group">
        <label><FontAwesomeIcon icon={faBus} /> Transport Access</label>
        <div className="options-grid">
          {transportOptions.map(opt => (
            <div
              key={opt.name}
              className={`option-card ${formData.transportDistance === opt.name ? 'selected' : ''}`}
              onClick={() => handleChange({ target: { name: 'transportDistance', value: opt.name } })}
            >
              <div className="option-emoji">{opt.emoji}</div>
              <div className="option-title">{opt.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Step4Amenities = ({ formData, handleChange }) => {
  const amenities = [
    { emoji: '📶', name: 'WiFi' },
    { emoji: '❄️', name: 'Air Conditioning' },
    { emoji: '🧺', name: 'Laundry' },
    { emoji: '🚿', name: 'Hot Water' },
    { emoji: '🛗', name: 'Lift' },
    { emoji: '🅿️', name: 'Free Car Parking' },
    { emoji: '⚡', name: 'EV Charging' }
  ];

  const foodOptions = [
    { emoji: '❌', name: 'Not Available' },
    { emoji: '🥗', name: 'Vegetarian' },
    { emoji: '🍗', name: 'Non-Vegetarian' },
    { emoji: '🍽️', name: 'Both' }
  ];

  const genderOptions = [
    { emoji: '👨', name: 'Male' },
    { emoji: '👩', name: 'Female' }
  ];

  const handleCheckboxChange = (amenity) => {
    const newAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity];
    handleChange({ target: { name: 'amenities', value: newAmenities } });
  };

  return (
    <div className="step-content">
      <h2 className="step-title">
        <span>✨</span> Amenities & Preferences
      </h2>

      <div className="form-group">
        <label><FontAwesomeIcon icon={faUtensils} /> Food Facility</label>
        <div className="options-grid">
          {foodOptions.map(opt => (
            <div
              key={opt.name}
              className={`option-card ${formData.foodFacility === opt.name ? 'selected' : ''}`}
              onClick={() => handleChange({ target: { name: 'foodFacility', value: opt.name } })}
            >
              <div className="option-emoji">{opt.emoji}</div>
              <div className="option-title">{opt.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label><FontAwesomeIcon icon={faVenusMars} /> Host Gender</label>
        <div className="options-grid">
          {genderOptions.map(opt => (
            <div
              key={opt.name}
              className={`option-card ${formData.hostGender === opt.name ? 'selected' : ''}`}
              onClick={() => handleChange({ target: { name: 'hostGender', value: opt.name } })}
            >
              <div className="option-emoji">{opt.emoji}</div>
              <div className="option-title">{opt.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label><FontAwesomeIcon icon={faWifi} /> Amenities (Select multiple)</label>
        <div className="multi-select-grid">
          {amenities.map(item => (
            <div
              key={item.name}
              className={`multi-option ${formData.amenities.includes(item.name) ? 'selected' : ''}`}
              onClick={() => handleCheckboxChange(item.name)}
            >
              <div className="multi-emoji">{item.emoji}</div>
              <div className="multi-label">{item.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label><FontAwesomeIcon icon={faTag} /> Discount (%)</label>
        <input 
          type="range" 
          name="discount" 
          min="0" 
          max="100" 
          value={formData.discount} 
          onChange={handleChange} 
          style={{ width: '100%' }}
        />
        <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#e91e63' }}>
          {formData.discount}% OFF
        </div>
      </div>
    </div>
  );
};

const Step5Media = ({ 
  existingImages, newImages, removedImageIds, 
  handleRemoveExistingImage, handleRemoveNewImage, handleMediaUpload,
  formData, handleUnavailableChange, today, maxDate,
  uploadContainerRef, API_BASE_URL
}) => {
  return (
    <div className="step-content">
      <h2 className="step-title">
        <span>📸</span> Photos & Availability
      </h2>

      {/* IMAGE UPLOAD SECTION */}
      <div className="form-group">
        <label><FontAwesomeIcon icon={faImages} /> Upload Photos & Videos</label>
        
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
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/placeholder.png';
                    }}
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
                <div key={`new-${index}-${file.name}`} className="preview-item">
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
                Click to upload
                <input
                  type="file"
                  id="media"
                  multiple
                  accept="image/*,video/*"
                  className="file-input"
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

      {/* CALENDAR SECTION */}
      <div className="form-group">
        <label><FontAwesomeIcon icon={faCalendarAlt} /> Host Unavailable Dates</label>
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
    </div>
  );
};

// Main Component
const HostIndex = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', location: '', latitude: '', longitude: '',
    maxdays: '', propertyType: '', capacity: '', roomType: '', bedrooms: '', beds: '',
    roomSize: '', roomLocation: '', transportDistance: '', hostGender: '', foodFacility: '',
    amenities: [], discount: 0, unavailableDates: [],
  });

  const [errors, setErrors] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
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

  // Steps configuration
  const steps = [
    { number: 1, title: 'Basic Info', emoji: '🏠', icon: faHome },
    { number: 2, title: 'Location', emoji: '📍', icon: faMapMarkerAlt },
    { number: 3, title: 'Room Details', emoji: '🛏️', icon: faBed },
    { number: 4, title: 'Amenities', emoji: '✨', icon: faWifi },
    { number: 5, title: 'Media', emoji: '📸', icon: faImages }
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = '/';
  };

  const handleRefresh = async () => {
    if (listingId) {
      setIsRefreshing(true);
      try {
        await fetchListing(listingId);
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Refresh failed:', error);
        alert('Failed to refresh listing data');
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    let interval;
    if (listingId) {
      interval = setInterval(() => {
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
      
      setExistingImages(l.images || []);
      
    } catch (err) { 
      console.error('Error fetching listing:', err); 
      alert('Failed to load listing data');
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (type === 'checkbox') {
      // Handle checkbox separately
    } else if (name === 'amenities' && Array.isArray(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUnavailableChange = (dates) => {
    setFormData(prev => ({ ...prev, unavailableDates: dates }));
  };

  const handleRemoveExistingImage = (imageId) => {
    setRemovedImageIds(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(id => id !== imageId));
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMediaUpload = (files) => {
    const filesArray = Array.from(files);
    setNewImages(prev => [...prev, ...filesArray]);
  };

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

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.title?.trim()) newErrors.title = 'Title is required';
      if (!formData.description?.trim()) newErrors.description = 'Description is required';
      if (!formData.price) newErrors.price = 'Price is required';
      if (!formData.maxdays) newErrors.maxdays = 'Maximum days is required';
    } else if (step === 2) {
      if (!formData.location?.trim()) newErrors.location = 'Location is required';
      if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
      if (!formData.latitude) newErrors.latitude = 'Latitude is required';
      if (!formData.longitude) newErrors.longitude = 'Longitude is required';
    } else if (step === 3) {
      if (!formData.roomType) newErrors.roomType = 'Room type is required';
      if (!formData.capacity) newErrors.capacity = 'Capacity is required';
      if (!formData.bedrooms) newErrors.bedrooms = 'Bedrooms is required';
      if (!formData.beds) newErrors.beds = 'Beds is required';
      if (!formData.roomSize) newErrors.roomSize = 'Room size is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only allow submission on step 5
    if (currentStep !== 5) {
      console.log('Cannot submit on step', currentStep);
      return;
    }
    
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

    const remainingExistingImages = existingImages.filter(id => !removedImageIds.includes(id));
    data.append('existingImages', JSON.stringify(remainingExistingImages));
    
    if (removedImageIds.length > 0) {
      data.append('removedImages', removedImageIds.join(','));
    }

    newImages.forEach(file => {
      data.append('images', file);
    });

    try {
      const url = listingId 
        ? `${API_BASE_URL}/api/rooms/listings/${listingId}` 
        : `${API_BASE_URL}/api/rooms/listings`;
      
      const method = listingId ? 'put' : 'post';
      
      const token = localStorage.getItem('token');
      
      const response = await axios({
        method,
        url,
        data,
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert(listingId ? '✅ Listing updated successfully!' : '✅ Listing created successfully!');
        window.location.href = '/dashboard';
      } else {
        alert('❌ Failed to save listing: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Submit error:', err);
      let errorMessage = 'Failed to save listing';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 3);

  const getStepContent = () => {
    switch(currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} handleChange={handleChange} errors={errors} />;
      case 2:
        return <Step2Location formData={formData} handleChange={handleChange} setFormData={setFormData} errors={errors} />;
      case 3:
        return <Step3RoomDetails formData={formData} handleChange={handleChange} errors={errors} />;
      case 4:
        return <Step4Amenities formData={formData} handleChange={handleChange} />;
      case 5:
        return <Step5Media 
          existingImages={existingImages}
          newImages={newImages}
          removedImageIds={removedImageIds}
          handleRemoveExistingImage={handleRemoveExistingImage}
          handleRemoveNewImage={handleRemoveNewImage}
          handleMediaUpload={handleMediaUpload}
          formData={formData}
          handleUnavailableChange={handleUnavailableChange}
          today={today}
          maxDate={maxDate}
          uploadContainerRef={uploadContainerRef}
          API_BASE_URL={API_BASE_URL}
        />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="host-top-navbar">
        <div className="host-logo"><h2>ShelterSeek</h2></div>
        
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
              <li><button onClick={handleLogout}>Logout</button></li>
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
          {/* Stepper */}
          <div className="stepper-container">
            <div className="stepper">
              <div className="stepper-line"></div>
              <div 
                className="stepper-progress" 
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              ></div>
              
              {steps.map(step => (
                <div 
                  key={step.number} 
                  className="step-item"
                  onClick={() => {
                    if (step.number < currentStep) {
                      setCurrentStep(step.number);
                    }
                  }}
                >
                  <div 
                    className={`step-circle 
                      ${step.number < currentStep ? 'completed' : ''} 
                      ${step.number === currentStep ? 'active' : ''}
                    `}
                  >
                    {step.number < currentStep ? <FontAwesomeIcon icon={faCheck} /> : step.number}
                  </div>
                  <div 
                    className={`step-label 
                      ${step.number === currentStep ? 'active' : ''}
                      ${step.number < currentStep ? 'completed' : ''}
                    `}
                  >
                    {step.emoji} {step.title}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress dots for mobile */}
            <div className="progress-indicator">
              {steps.map(step => (
                <div
                  key={step.number}
                  className={`progress-dot 
                    ${step.number === currentStep ? 'active' : ''}
                    ${step.number < currentStep ? 'completed' : ''}
                  `}
                />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {getStepContent()}

            {/* Map preview for step 2 */}
            {currentStep === 2 && formData.latitude && formData.longitude && (
              <div className="form-group">
                <label>🗺️ Location Map (Click to set)</label>
                <MapContainer 
                  center={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} 
                  zoom={13} 
                  style={{height:'300px', borderRadius:'12px', marginTop: '1rem'}}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} />
                  <MapUpdater 
                    latitude={formData.latitude} 
                    longitude={formData.longitude} 
                    setFormData={setFormData} 
                  />
                </MapContainer>
              </div>
            )}

            {/* Navigation Buttons - FIXED VERSION */}
            <div className="step-navigation">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  onClick={handlePrev}
                  className="nav-btn prev"
                  disabled={isSubmitting}
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Previous
                </button>
              )}
              
              {currentStep < 5 ? (
                <button 
                  type="button" 
                  onClick={handleNext}
                  className="nav-btn next"
                  style={{ marginLeft: currentStep === 1 ? 'auto' : '0' }}
                  disabled={isSubmitting}
                >
                  Next <FontAwesomeIcon icon={faArrowRight} />
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="nav-btn submit"
                  disabled={isSubmitting || isRefreshing}
                  style={{ marginLeft: 'auto' }}
                >
                  <FontAwesomeIcon icon={faSave} /> {isSubmitting ? 'Saving...' : (listingId ? 'Update Listing' : 'Create Listing')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: '#e91e63', fontWeight: 'bold' }}>
            {listingId ? 'Updating listing...' : 'Creating listing...'}
          </p>
        </div>
      )}

      <Footer />
      
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          .error-message {
            color: #f44336;
            font-size: 0.85rem;
            margin-top: 0.25rem;
            padding: 0.5rem;
            background: #ffebee;
            border-radius: 4px;
            border-left: 3px solid #f44336;
            display: block;
          }
          
          input.error,
          textarea.error,
          select.error {
            border-color: #f44336 !important;
            background-color: #fff8f8;
          }
          
          .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            z-index: 9999;
            backdrop-filter: blur(5px);
          }
          
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #e91e63;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default HostIndex;