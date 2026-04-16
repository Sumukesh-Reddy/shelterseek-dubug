// pages/HomePage.jsx
import React, { useState, useEffect } from 'react'; // eslint-disable-line no-unused-vars
import Navbar from '../../components/Navbar/Navbar';
import Slider from '../../components/Slider/Slider';
import FilterMenu from '../../components/FilterMenu/FilterMenu';
import HomeListings from '../../components/HomeListings/HomeListings';
import TravelContent from '../../components/travelerContent/travelerContent';
import MapComponent from '../../components/Map/MapComponent';
import ExplorerButton from '../../components/ExploreButton/ExploreButton.jsx';
import Footer from '../../components/Footer/Footer';
import './HomePage.css';

// 1. Import the Intro Component
import IntroAnimation from '../../components/IntroAnimation/IntroAnimation'; 

const HomePage = () => {
  // 2. Add state for showing the intro
  // We check sessionStorage so it only runs once per browser session
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('hasSeenIntro');
  });

  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    checkIn: '',
    days: 1,
    roomType: 'any',
    bedrooms: 1,
    beds: 1,
    adults: 0,
    children: 0,
    minPrice: parseInt(localStorage.getItem('priceMin')) || 500,
    maxPrice: parseInt(localStorage.getItem('priceMax')) || 9500,
    selectedTypes: [],
    selectedLocations: [],
    selectedAmenities: [],
    hostGender: 'any',
    foodPreferences: [],
    roomSize: 'any',
    transport: 'Any',
    searchKeywords: ''
  });

  // 3. Handler for when the door animation finishes
  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  const toggleFilterMenu = () => {
    console.log('Toggling filter menu:', !showFilter);
    setShowFilter(!showFilter);
  };

  const applyFilters = (newFilters) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
    setShowFilter(false);
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, searchKeywords: e.target.value }));
  };

  return (
    <div className="home-page">
      {/* 4. Conditionally Render the Intro */}
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}

      <Navbar searchKeywords={filters.searchKeywords} onSearchChange={handleSearchChange} />
      <Slider />
      <br/>
      <hr/>
      <button
        id="filter-button"
        className="filter-button"
        onClick={toggleFilterMenu}
      >
        <i className="fas fa-filter"></i>
        <span>filter</span>
      </button>
      {showFilter && (
        <FilterMenu
          onClose={toggleFilterMenu}
          onApply={applyFilters}
          currentFilters={filters}
        />
      )}
      <HomeListings filters={filters} />
      <TravelContent/>
      <ExplorerButton/>
      <MapComponent/>
      <Footer/>
    </div>
  );
};

export default HomePage;