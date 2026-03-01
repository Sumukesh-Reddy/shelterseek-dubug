import React, { useState, useEffect } from 'react';
import './Slider.css';

const Slider = () => {
  const photos = [
    "/images/photo1.jpg",
    "/images/photo2.jpg",
    "/images/photo3.jpg",
    "/images/photo4.jpg"
  ];
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) => 
        prevIndex === photos.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [photos.length]);

  return (
    <div className="slide-1">
      <div 
        className="slide-2" 
        style={{ backgroundImage: `url(${photos[currentPhotoIndex]})` }}
      ></div>
      <div className="slide-3">
        <h2>Welcome to ShelterSeek!</h2>
        <p>
          Discover your perfect travel destination with just a click. Explore, plan, 
          and create unforgettable memories. Whether you're seeking adventure, 
          relaxation, or cultural experiences, we've got something for every traveler.
        </p>
      </div>
    </div>
  );
};

export default Slider;