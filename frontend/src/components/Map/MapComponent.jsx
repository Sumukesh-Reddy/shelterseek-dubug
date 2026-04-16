import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = () => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Initialize map
    const mapInstance = L.map('map').setView([13.0827, 80.2707], 10);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);
    
    setMap(mapInstance);

    // Cleanup function
    return () => {
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    // Fetch rooms and add markers
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/rooms`);
        const result = await response.json();
        
        if (result.status === "success" && Array.isArray(result.data)) {
          const rooms = result.data;
          const bounds = [];
          
          rooms.forEach(room => {
            if (room.coordinates && typeof room.coordinates.lat === "number" && typeof room.coordinates.lng === "number") {
              const marker = L.marker([room.coordinates.lat, room.coordinates.lng]).addTo(map);
              marker.bindPopup(`
                <strong>${room.title || 'Untitled Property'}</strong><br>
                ${room.description || 'No description available'}<br>
                <em>Price: ₹${room.price || 'N/A'}</em>
              `);
              bounds.push([room.coordinates.lat, room.coordinates.lng]);
            }
          });
          
          // Fit map to markers if any
          if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [40, 40] });
          }
        }
      } catch (err) {
        console.error("Error loading map data:", err);
      }
    };

    fetchRooms();
  }, [map]);

  return (
    <div className="interactive-map">
      <h2>Explore Our Destinations</h2>
      <div id="map" style={{ height: '400px', width: '100%' }}></div>
    </div>
  );
};

export default MapComponent;