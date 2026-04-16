// components/HomeListings/HomeListings.jsx
import React, { useState, useEffect } from 'react';
import HomeBlock from '../HomeBlock/HomeBlock';
import {  categorizeSize } from '../sortedHousesUtils';
import './HomeListings.css';

const HomeListings = ({ filters }) => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/rooms');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.status === 'success' && Array.isArray(result.data)) {
          const processedRooms = result.data.map(room => ({
            ...room,
            size: categorizeSize(room.roomSize),
            host: {
              gen: room.hostGender || '',
              email: room.email || '',
              food: room.foodFacility || '',
              name: room.name || 'Unknown Host',
              image: room.hostImage || '/images/logo.png',
              yearsWithUs: room.yearsWithUs || 0,
              latitude: room.coordinates?.lat || 0,
              longitude: room.coordinates?.lng || 0
            },
            maxdays: room.maxStayDays || 10,
            amenities: Array.isArray(room.amenities) ? room.amenities : 
                      Object.keys(room.amenities || {}).filter(key => room.amenities[key])
          }));
          setRooms(processedRooms);
        } else {
          setError('No room data found.');
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load rooms. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Apply filters to rooms
  const filteredRooms = rooms.filter(room => {
    const homePrice = parseFloat(room.price);
    const matchesKeywords = !filters.searchKeywords || 
      filters.searchKeywords.split(',').map(k => k.trim().toLowerCase()).some(keyword => 
        room.title.toLowerCase().includes(keyword) || 
        room.location.toLowerCase().includes(keyword)
      );
    const matchesPrice = homePrice >= filters.minPrice && homePrice <= filters.maxPrice;
    const matchesRoomType = filters.roomType === 'any' || room.roomType?.toLowerCase() === filters.roomType;
    const matchesBedrooms = filters.bedrooms <= (room.bedrooms || 0);
    const matchesBeds = filters.beds <= (room.beds || 0);
    const matchesAdults = filters.adults <= (room.capacity || 0);
    const matchesChildren = filters.children <= (room.capacity || 0);
    const matchesPropertyType = filters.selectedTypes.length === 0 || 
    (room.propertyType && filters.selectedTypes.some(type => 
      room.propertyType.toLowerCase() === type.toLowerCase().replace(/\s+/g, '-')
    ));
      const matchesLocation = filters.selectedLocations.length === 0 || 
      (room.roomLocation && filters.selectedLocations.some(location => 
        room.roomLocation.toLowerCase() === location.toLowerCase().replace(/\s+/g, '-')
      ));
      const matchesAmenities = filters.selectedAmenities.length === 0 || 
      filters.selectedAmenities.every(amenity => {
        const amenityKey = amenity.toLowerCase().replace(/\s+/g, '-');
        return Array.isArray(room.amenities) && room.amenities.includes(amenityKey);
      });
    const matchesHostGender = filters.hostGender === 'any' || 
      room.hostGender?.toLowerCase() === filters.hostGender;
    const matchesRoomSize = filters.roomSize === 'any' || 
      room.size.toLowerCase() === filters.roomSize;
    const matchesTransport = filters.transport === 'Any' || 
      room.transportDistance === filters.transport;
      const matchesFoodPreferences = filters.foodPreferences.length === 0 || 
      (room.foodFacility && filters.foodPreferences.some(food => 
        room.foodFacility.toLowerCase() === food.toLowerCase()
      ));
    const matchesDays = !room.maxdays || room.maxdays >= filters.days;

    return (
      matchesKeywords &&
      matchesPrice &&
      matchesRoomType &&
      matchesBedrooms &&
      matchesBeds &&
      matchesAdults &&
      matchesChildren &&
      matchesPropertyType &&
      matchesLocation &&
      matchesAmenities &&
      matchesHostGender &&
      matchesRoomSize &&
      matchesTransport &&
      matchesFoodPreferences &&
      matchesDays
    );
  });

  useEffect(() => {
    console.log('Filtered rooms:', filteredRooms);
  }, [filteredRooms]);

  return (
    <div className="main-home-block" id="homes-container">
      {isLoading && <div className="loading">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      {filteredRooms.length === 0 && !isLoading && !error && (
        <div className="no-results">No rooms match your filters.</div>
      )}
      {filteredRooms.map(room => (
        <HomeBlock key={room._id} room={room} />
      ))}
    </div>
  );
};

export default HomeListings;