// components/FilterMenu/FilterMenu.jsx
import React, { useState, useEffect } from 'react';
import './FilterMenu.css';

const FilterMenu = ({ onClose, onApply, currentFilters }) => {
  const [filters, setFilters] = useState({
    checkIn: currentFilters.checkIn || '',
    days: currentFilters.days || 1,
    roomType: currentFilters.roomType || 'any',
    bedrooms: currentFilters.bedrooms || 1,
    beds: currentFilters.beds || 1,
    adults: currentFilters.adults || 0,
    children: currentFilters.children || 0,
    minPrice: currentFilters.minPrice || parseInt(localStorage.getItem('priceMin')) || 0,
    maxPrice: currentFilters.maxPrice || parseInt(localStorage.getItem('priceMax')) || 10000,
    selectedTypes: currentFilters.selectedTypes || [],
    selectedLocations: currentFilters.selectedLocations || [],
    selectedAmenities: currentFilters.selectedAmenities || [],
    hostGender: currentFilters.hostGender || 'any',
    foodPreferences: currentFilters.foodPreferences || [],
    roomSize: currentFilters.roomSize || 'any',
    transport: currentFilters.transport || 'any'
  });

  const minGap = 1500;
  const sliderMinValue = 0;
  const sliderMaxValue = 10000;

  useEffect(() => {
    const storedMin = parseInt(localStorage.getItem('priceMin'));
    const storedMax = parseInt(localStorage.getItem('priceMax'));
    if (storedMin && storedMax) {
      setFilters(prev => ({
        ...prev,
        minPrice: storedMin,
        maxPrice: storedMax
      }));
    }
  }, []);

  useEffect(() => {
    const rangeSelected = document.querySelector('.range-selected');
    const minPercent = ((filters.minPrice - sliderMinValue) / (sliderMaxValue - sliderMinValue)) * 100;
    const maxPercent = ((filters.maxPrice - sliderMinValue) / (sliderMaxValue - sliderMinValue)) * 100;
    rangeSelected.style.left = `${minPercent}%`;
    rangeSelected.style.right = `${100 - maxPercent}%`;
  }, [filters.minPrice, filters.maxPrice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCounter = (field, operation) => {
    setFilters(prev => ({
      ...prev,
      [field]: operation === 'add' ? prev[field] + 1 : Math.max(0, prev[field] - 1)
    }));
  };

  const handleRadioChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field, value) => {
    setFilters(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseInt(value) || 0;
    setFilters(prev => {
      let updatedMin = prev.minPrice;
      let updatedMax = prev.maxPrice;
      if (name === 'minPrice') {
        updatedMin = newValue > prev.maxPrice - minGap ? prev.maxPrice - minGap : newValue;
      } else if (name === 'maxPrice') {
        updatedMax = newValue < prev.minPrice + minGap ? prev.minPrice + minGap : newValue;
      }
      localStorage.setItem('priceMin', updatedMin);
      localStorage.setItem('priceMax', updatedMax);
      return {
        ...prev,
        minPrice: updatedMin,
        maxPrice: updatedMax
      };
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  return (
    <div className="filter-menu" style={{ display: 'block' }}>
      <button className="filter-close-button" onClick={onClose}>&times;</button>

      {/* Check-in Date */}
      <div className="filter-group">
        <label><b>Check-in Date:</b></label>
        <input
          type="date"
          name="checkIn"
          value={filters.checkIn}
          onChange={handleInputChange}
        />
      </div>

      {/* Days */}
      <div className="filter-group">
        <label><b>Days:</b></label>
        <div className="counter">
          <button onClick={() => handleCounter('days', 'sub')}>-</button>
          <span>{filters.days}</span>
          <button onClick={() => handleCounter('days', 'add')}>+</button>
        </div>
      </div>

      {/* Room Type */}
      <div className="filter-group">
        <label><b>Room Type:</b></label>
        <div className="room-options">
          {['Any', 'Shared', 'Full'].map(type => (
            <div
              key={type}
              className={`room-box ${filters.roomType === type.toLowerCase() ? 'active' : ''}`}
              onClick={() => handleRadioChange('roomType', type.toLowerCase())}
              data-value={type.toLowerCase()}
            >
              {type}
            </div>
          ))}
        </div>
      </div>

      {/* Bedrooms */}
      <div className="filter-group">
        <label><b>Bedrooms:</b></label>
        <div className="counter">
          <button onClick={() => handleCounter('bedrooms', 'sub')}>-</button>
          <span>{filters.bedrooms}</span>
          <button onClick={() => handleCounter('bedrooms', 'add')}>+</button>
        </div>
      </div>

      {/* Beds */}
      <div className="filter-group">
        <label><b>Beds:</b></label>
        <div className="counter">
          <button onClick={() => handleCounter('beds', 'sub')}>-</button>
          <span>{filters.beds}</span>
          <button onClick={() => handleCounter('beds', 'add')}>+</button>
        </div>
      </div>

      {/* Adults */}
      <div className="filter-group">
        <label><b>Adults:</b></label>
        <div className="counter">
          <button onClick={() => handleCounter('adults', 'sub')}>-</button>
          <span>{filters.adults}</span>
          <button onClick={() => handleCounter('adults', 'add')}>+</button>
        </div>
      </div>

      {/* Children */}
      <div className="filter-group">
        <label><b>Children:</b></label>
        <div className="counter">
          <button onClick={() => handleCounter('children', 'sub')}>-</button>
          <span>{filters.children}</span>
          <button onClick={() => handleCounter('children', 'add')}>+</button>
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <label><b>Price Range</b></label>
        <div className="sliders_control">
          <div className="range-slider">
            <div className="range-selected"></div>
          </div>
          <div className="range-input">
            <input
              type="range"
              name="minPrice"
              min={sliderMinValue}
              max={sliderMaxValue}
              value={filters.minPrice}
              onChange={handlePriceChange}
              aria-label="Minimum price"
              aria-valuemin={sliderMinValue}
              aria-valuemax={sliderMaxValue}
              aria-valuenow={filters.minPrice}
              className="min-input"
            />
            <input
              type="range"
              name="maxPrice"
              min={sliderMinValue}
              max={sliderMaxValue}
              value={filters.maxPrice}
              onChange={handlePriceChange}
              aria-label="Maximum price"
              aria-valuemin={sliderMinValue}
              aria-valuemax={sliderMaxValue}
              aria-valuenow={filters.maxPrice}
              className="max-input"
            />
          </div>
          <div className="range-price">
            <label>Min: ₹</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handlePriceChange}
              className="min-price"
            />
            <label>Max: ₹</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handlePriceChange}
              className="max-price"
            />
          </div>
        </div>
      </div>

      {/* Type of House */}
      <div className="filter-group">
        <label><b>Type of House:</b></label>
        <div className="multi-select">
          {['PG', 'House', 'Resort', 'Villa', 'Duplex', 'Cottage', 'Apartment', 'Hostels', 'Farm House'].map(type => (
            <div
              key={type}
              className={`select-box ${filters.selectedTypes.includes(type) ? 'active' : ''}`}
              onClick={() => handleMultiSelect('selectedTypes', type)}
              data-value={type}
            >
              {type}
            </div>
          ))}
        </div>
        <input type="hidden" id="selected-room-types" value={filters.selectedTypes.join(',')} />
      </div>

      {/* Room Location */}
      <div className="filter-group">
        <label><b>Room Location:</b></label>
        <div className="multi-select" id="room-location">
          {['In Town', 'Outside of Town', 'Nearby Villages', 'Residential Area', 'Commercial Area', 'Near Highway', 'Countryside'].map(location => (
            <div
              key={location}
              className={`select-box ${filters.selectedLocations.includes(location) ? 'active' : ''}`}
              onClick={() => handleMultiSelect('selectedLocations', location)}
              data-value={location}
            >
              {location}
            </div>
          ))}
        </div>
        <input type="hidden" id="selected-room-location" value={filters.selectedLocations.join(',')} />
      </div>

      {/* Room Near a Transport Station */}
      <div className="filter-group">
        <label><b>Room Near a Transport Station:</b></label>
        <div className="radio-group">
          {['any', '2 km', '5 km', '10 km'].map(transport => (
            <div
              key={transport}
              className={`radio-option ${filters.transport === transport ? 'active' : ''}`}
              onClick={() => handleRadioChange('transport', transport)}
            >
              {transport}
              <input type="radio" name="transport" value={transport} checked={filters.transport === transport} readOnly style={{ display: 'none' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Room Size */}
      <div className="filter-group">
        <label><b>Room Size:</b></label>
        <div className="radio-group">
          {['any', 'Small', 'Medium', 'Large'].map(size => (
            <div
              key={size}
              className={`radio-option ${filters.roomSize === size.toLowerCase() ? 'active' : ''}`}
              onClick={() => handleRadioChange('roomSize', size.toLowerCase())}
            >
              {size}
              <input type="radio" name="roomSize" value={size.toLowerCase()} checked={filters.roomSize === size.toLowerCase()} readOnly style={{ display: 'none' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="filter-group">
        <label><b>Amenities:</b></label>
        <div className="multi-select">
          {['WiFi', 'AC', 'Laundry', 'Hot Water', 'Lift', 'Free Car Parking', 'EV Charging'].map(amenity => (
            <div
              key={amenity}
              className={`select-box ${filters.selectedAmenities.includes(amenity) ? 'active' : ''}`}
              onClick={() => handleMultiSelect('selectedAmenities', amenity)}
              data-value={amenity}
            >
              {amenity}
            </div>
          ))}
        </div>
        <input type="hidden" id="selected-amenities" value={filters.selectedAmenities.join(',')} />
      </div>

      {/* Host Gender */}
      <div className="filter-group">
        <label><b>Host Gender:</b></label>
        <div className="radio-group">
          {['any', 'Male', 'Female', 'Family-friendly'].map(gender => (
            <div
              key={gender}
              className={`radio-option ${filters.hostGender === gender.toLowerCase() ? 'active' : ''}`}
              onClick={() => handleRadioChange('hostGender', gender.toLowerCase())}
            >
              {gender}
              <input type="radio" name="hostGender" value={gender.toLowerCase()} checked={filters.hostGender === gender.toLowerCase()} readOnly style={{ display: 'none' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Food Preferences */}
      <div className="filter-group">
        <label><b>Food Preferences:</b></label>
        <div className="multi-select">
          {['Vegetarian', 'Non-Vegetarian', 'both'].map(food => (
            <div
              key={food}
              className={`select-box ${filters.foodPreferences.includes(food) ? 'active' : ''}`}
              onClick={() => handleMultiSelect('foodPreferences', food)}
              data-value={food}
            >
              {food}
            </div>
          ))}
        </div>
        <input type="hidden" id="selected-food-preferences" value={filters.foodPreferences.join(',')} />
      </div>

      {/* Search Button */}
      <div className="filter-search">
        <button id="filter-search-button" onClick={handleApply}>search</button>
      </div>
    </div>
  );
};

export default FilterMenu;