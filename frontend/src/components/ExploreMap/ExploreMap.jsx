// components/ExplorerMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ExplorerMap.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: "<div style='font-size:30px;'>👤</div>",
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const hotelIcon = L.divIcon({
  className: 'hotel-marker',
  html: "<div style='font-size:30px;'>🏡</div>",
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

// Component to handle map view updates
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

const ExplorerMap = ({ isOpen, onClose }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyRooms, setNearbyRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]); // Default: Chennai
  const [mapZoom, setMapZoom] = useState(10);

  const locateUser = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
          setMapZoom(13);
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please check your browser permissions.');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const findNearbyHotels = async () => {
    if (!userLocation) {
      alert('Please locate yourself first or allow location access.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/rooms');
      const result = await response.json();
      
      if (result.status === "success" && Array.isArray(result.data)) {
        const rooms = result.data;
        const nearby = [];
        
        rooms.forEach(room => {
          if (room.coordinates && typeof room.coordinates.lat === "number" && typeof room.coordinates.lng === "number") {
            const distance = calculateDistance(
              userLocation.lat, userLocation.lng,
              room.coordinates.lat, room.coordinates.lng
            );
            
            if (distance <= 50) { // 50km radius
              nearby.push({
                ...room,
                distance: distance
              });
            }
          }
        });
        
        setNearbyRooms(nearby);
        
        if (nearby.length === 0) {
          alert('No hotels found within 50km of your location.');
        }
      } else {
        console.error("No room data found for map.");
      }
    } catch (err) {
      console.error("Error loading hotel data:", err);
      alert('Failed to load hotel data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const viewHotelDetails = (hotelId) => {
    window.location.href = `/room/${hotelId}`;
  };

  if (!isOpen) return null;

  return (
    <div className="explorer-modal-overlay" onClick={onClose}>
      <div className="explorer-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="explorer-modal-header">
          <h2>Explore Nearby Accommodations</h2>
          <button className="explorer-close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="explorer-modal-body">
          <div className="explorer-map-container">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <MapUpdater center={mapCenter} zoom={mapZoom} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors'
              />
              
              {/* User Location Marker */}
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}
              
              {/* Nearby Hotel Markers */}
              {nearbyRooms.map((room) => (
                <Marker 
                  key={room._id} 
                  position={[room.coordinates.lat, room.coordinates.lng]} 
                  icon={hotelIcon}
                >
                  <Popup>
                    <div className="hotel-popup">
                      <strong>{room.title}</strong><br />
                      {room.description}<br />
                      <em>Price: ₹{room.price}</em><br />
                      <em>Distance: {room.distance.toFixed(1)} km</em><br />
                      <button 
                        onClick={() => viewHotelDetails(room._id)}
                        className="view-details-btn"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          
          <div className="explorer-map-controls">
            <button 
              onClick={locateUser} 
              className="explorer-control-btn"
              disabled={loading}
            >
              {loading ? <span className="loading-spinner"></span> : 'Locate Me'}
              {loading && 'Locating...'}
            </button>
            
            <button 
              onClick={findNearbyHotels} 
              className="explorer-control-btn"
              disabled={loading || !userLocation}
            >
              {loading ? <span className="loading-spinner"></span> : 'Find Nearby Hotels'}
              {loading && 'Searching...'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorerMap;