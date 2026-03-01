// components/ExplorerButton.jsx
import React, { useState } from 'react';
import ExplorerMap from '../ExploreMap/ExploreMap.jsx';
import './ExplorerButton.css';

const ExplorerButton = () => {
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <>
      <button 
        className="map-explorer-button"
        onClick={() => setIsMapOpen(true)}
      >
        <i className="fa fa-map-marker" aria-hidden="true"></i>
        Nearby Rooms
      </button>

      <ExplorerMap 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
      />
    </>
  );
};

export default ExplorerButton;