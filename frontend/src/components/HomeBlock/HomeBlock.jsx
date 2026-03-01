import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeBlock.css';

const HomeBlock = ({ room }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  // Process image paths - convert image IDs to URLs
  const processImagePaths = (images) => {
    if (!Array.isArray(images) || images.length === 0) {
      return ['/images/default-house.jpg'];
    }
    return images.map(img => {
      if (typeof img === 'string') {
        // If it's already a URL path
        if (img.startsWith('http') || img.startsWith('/')) {
          return img.startsWith('http') ? img : `http://localhost:3001${img}`;
        }
        // If it's an image ID (24 character hex string)
        if (/^[0-9a-fA-F]{24}$/.test(img)) {
          return `http://localhost:3001/api/images/${img}`;
        }
      }
      return '/images/default-house.jpg';
    });
  };

  const imageUrls = processImagePaths(room.images || []);
  const images = imageUrls.length > 0 ? imageUrls : ['/images/default-house.jpg'];

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleClick = () => {
    // Check if user is logged in
    const currentUser =sessionStorage.getItem("currentUser") ||localStorage.getItem("user");

    if (!currentUser) {
      // User not logged in - redirect to login selection page
      // Store the intended destination for redirect after login
      sessionStorage.setItem("redirectAfterLogin", `/room/${room._id}`);
      navigate("/loginweb");
    } else {
      // User is logged in - navigate to room details
      navigate(`/room/${room._id}`);
    }
  };

  return (
    <div
      className={`home-block ${room.status === 'booked' ? 'booked' : ''}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="home-photos-block">
        {images.length > 1 && (
          <>
            <button
              className="image-nav-button left"
              onClick={prevImage}
            >
              &lt;
            </button>
            <button
              className="image-nav-button right"
              onClick={nextImage}
            >
              &gt;
            </button>
          </>
        )}
        <div className="home-image-container">
        <img
          src={images[currentImageIndex]}
          alt={room.title || 'Room image'}
          className="home-image"
          onError={(e) => {
            e.target.src = '/images/default-house.jpg';
          }}
        />
        </div>
        {room.status === 'booked' && (
          <div className="booked-overlay">Booked</div>
        )}
      </div>
      <hr style={{ opacity: 0.3 }} />
      <div className="home-content">
        <h3>{room.title || 'Untitled Property'}</h3>
        <p>Location: {room.location || 'Location not specified'}</p>
        <p className="price">
          ₹{Math.round(room.price * (1 - (room.discount || 0) / 100))}
          {room.discount > 0 && (
            <>
              <br />
              <span className="old-price">
                ₹{room.price}
              </span>
              <br />
              <span className="discount" >
                Discount: {room.discount}% off
              </span>
            </>
          )}
        </p>
        <p>{room.description || 'No description available'}</p>
      </div>
    </div>
  );
};

export default HomeBlock;