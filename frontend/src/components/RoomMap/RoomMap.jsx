import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const RoomMap = ({ latitude, longitude, title, description, price }) => {
  useEffect(() => {
    if (!latitude || !longitude) return;

    // Initialize map
    const mapInstance = L.map('room-map').setView([latitude, longitude], 15);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Add marker
    L.marker([latitude, longitude])
      .addTo(mapInstance)
      .bindPopup(`
        <strong>${title || 'Untitled Property'}</strong><br>
        ${description || 'No description available'}<br>
        <em>Price: ₹${price || 'N/A'}</em>
      `)
      .openPopup();

    // Cleanup function
    return () => {
      mapInstance.remove();
    };
  }, [latitude, longitude, title, description, price]);

  return (
    <div className="room-map-container">
      <h2 style={{ color: '#d72d6e' ,marginLeft:'10%'}} >Room Location</h2>
      <div id="room-map" style={{ height: '50vh', width: '1oovw' }}></div>
    </div>
  );
};

export default RoomMap;