import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShareAlt, 
  faChevronLeft, 
  faChevronRight, 
  faStar, 
  faStarHalfAlt, 
  faStar as faStarOutline,
  faHeart,
  faExclamationCircle,
  faCalendarAlt,
  faMapMarkerAlt,
  faWifi,
  faUtensils,
  faCar,
  faSnowflake,
  faTint,
  faUser,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import './RoomLayout.css';
import Footer from '../../components/Footer/Footer';
import RoomMap from '../../components/RoomMap/RoomMap';

const RoomLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likedHomes, setLikedHomes] = useState([]);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const calendarRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const persistLocalHistory = useCallback((roomId) => {
    if (!roomId) return;
    try {
      const stored = JSON.parse(localStorage.getItem('viewedHomes') || '[]');
      const history = Array.isArray(stored) ? stored : [];
      const deduped = history.filter(savedId => savedId !== roomId);
      deduped.unshift(roomId);
      localStorage.setItem('viewedHomes', JSON.stringify(deduped.slice(0, 50)));
    } catch (err) {
      console.error('Failed to persist viewed rooms locally:', err);
      localStorage.setItem('viewedHomes', JSON.stringify([roomId]));
    }
  }, []);

  const processRoomData = useCallback((roomData) => {
    const processImagePaths = (images) => {
      if (!Array.isArray(images)) return ['/images/photo1.jpg'];
      return images.map(img => {
        if (typeof img !== 'string' || img.length === 0) return '/images/photo1.jpg';
        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${img}`;
        // ObjectId OR filename — both served by /api/images/:id
        return `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/images/${img}`;
      });
    };

    const categorizeSize = (size) => {
      if (typeof size === 'string') {
        const lowerSize = size.toLowerCase();
        if (["small", "medium", "large"].includes(lowerSize)) {
          return lowerSize;
        }
      }
      return "medium";
    };

    const processAvailability = (availability) => {
      if (!Array.isArray(availability)) return [];
      return availability.map(date => {
        if (date instanceof Date) return date;
        if (typeof date === 'string') return new Date(date);
        if (date && date.$date) return new Date(date.$date);
        return null;
      }).filter(date => date && !isNaN(date.getTime()));
    };
    
    return {
      id: roomData._id || roomData.id,
      title: roomData.title || "Untitled Property",
      location: roomData.location || "Location not specified",
      price: parseFloat(roomData.price) || 0,
      description: roomData.description || "",
      size: categorizeSize(roomData.roomSize),
      discountPercentage: roomData.discount || 0,
      food: roomData.foodFacility || "not-available",
      transport: roomData.transportDistance || "",
      locationType: roomData.roomLocation || "",
      host: {
        gen: roomData.hostGender || "",
        email: roomData.email || "",
        food: roomData.foodFacility || "",
        name: roomData.name || "Unknown Host",
        image: roomData.hostImage || "/images/logo.png",
        yearsWithUs: roomData.yearsWithUs || 0,
        latitude: roomData.coordinates?.lat || 0,
        longitude: roomData.coordinates?.lng || 0
      },
      maxdays: roomData.maxdays || roomData.maxDays || 10,
      unavailableDates: processAvailability(roomData.unavailableDates),
      media: processImagePaths(roomData.images),
      review_main: roomData.reviews || [],
      amenities: {
        wifi: roomData.amenities?.includes("WiFi") || roomData.amenities?.includes("wifi") || false,
        ac: roomData.amenities?.includes("Air Conditioning") || roomData.amenities?.includes("ac") || false,
        laundry: roomData.amenities?.includes("Laundry") || roomData.amenities?.includes("laundry") || false,
        hotWater: roomData.amenities?.includes("Hot Water") || roomData.amenities?.includes("hotWater") || false,
        taps: roomData.amenities?.includes("taps") || false,
        lift: roomData.amenities?.includes("lift") || false,
        carParking: roomData.amenities?.includes("carParking") || false,
        EvCharging: roomData.amenities?.includes("EvCharging") || false,
        Electricity: roomData.amenities?.includes("Electricity") || false
      }
    };
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/rooms`);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        if (result.status === "success" && Array.isArray(result.data)) {
          const foundRoom = result.data.find(h => h._id === id);
          if (foundRoom) {
            const normalizedRoom = processRoomData(foundRoom);
            setRoom(normalizedRoom);
            persistLocalHistory(normalizedRoom.id);
            
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            if (token && userStr) {
              try {
                const user = JSON.parse(userStr);
                if (user.accountType === 'traveller') {
                  await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/users/traveler/viewed-rooms`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ roomId: id })
                  });
                }
              } catch (err) {
                console.error('Error tracking viewing history:', err);
              }
            }
          } else {
            setError("Room not found");
          }
        } else {
          setError("Failed to fetch rooms data");
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setError("Failed to load room details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
    const savedLikes = JSON.parse(localStorage.getItem("likedHomes") || "[]");
    setLikedHomes(savedLikes);
  }, [id, processRoomData, persistLocalHistory]);

  // Calendar swipe functionality
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next month
        handleNextMonth();
      } else {
        // Swipe right - previous month
        handlePrevMonth();
      }
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonthIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex(prev => prev + 1);
  };

  const buildCalendarMonths = (monthsToShow = 3) => {
    const months = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    for (let offset = 0; offset < monthsToShow; offset++) {
      const firstDay = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      const year = firstDay.getFullYear();
      const monthIndex = firstDay.getMonth();
      const label = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const days = [];
      const startWeekday = firstDay.getDay();
  
      // Empty slots before first day
      for (let i = 0; i < startWeekday; i++) {
        days.push(null);
      }
  
      // Days of month
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, monthIndex, day);
        const dateString = d.toISOString().split('T')[0];
        const todayString = today.toISOString().split('T')[0];
        
        // Block dates before today
        if (dateString < todayString) {
          days.push(null); // Blocked date - show as empty/disabled
        } else {
          days.push(dateString);
        }
      }
  
      months.push({
        key: `${year}-${monthIndex}`,
        label,
        days,
      });
    }
    return months;
  };

  const formatCurrency = (number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(number);
  };

  const generateStars = (rating) => {
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const halfStar = numericRating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return (
      <div className="room-stars">
        {[...Array(fullStars)].map((_, i) => (
          <FontAwesomeIcon key={`full-${i}`} icon={faStar} />
        ))}
        {halfStar ? <FontAwesomeIcon icon={faStarHalfAlt} /> : null}
        {[...Array(emptyStars)].map((_, i) => (
          <FontAwesomeIcon key={`empty-${i}`} icon={faStarOutline} />
        ))}
      </div>
    );
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews?.length) return 0;
    const sum = reviews.reduce((total, rev) => total + (rev.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + room.media.length) % room.media.length
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % room.media.length
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: room.title,
        text: `Check out this ${room.size} room in ${room.location}`,
        url: window.location.href
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          showSuccessMessage('Link copied to clipboard!');
        })
        .catch(() => {
          const shareUrl = `${window.location.origin}/room/${room.id}`;
          prompt("Copy this link to share:", shareUrl);
        });
    }
  };

  const showSuccessMessage = (message) => {
    setError({ type: 'success', message });
    setTimeout(() => setError(null), 3000);
  };

  const showErrorMessage = (message) => {
    setError({ type: 'error', message });
    setTimeout(() => setError(null), 5000);
  };

  const handleSave = async () => {
    const isLiked = likedHomes.includes(room.id);
    let updatedLikes;
    const action = isLiked ? 'remove' : 'add';
    
    if (isLiked) {
      updatedLikes = likedHomes.filter(id => id !== room.id);
      showSuccessMessage('Removed from wishlist');
    } else {
      updatedLikes = [...likedHomes, room.id];
      showSuccessMessage('Added to wishlist!');
    }
    
    setLikedHomes(updatedLikes);
    localStorage.setItem("likedHomes", JSON.stringify(updatedLikes));
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.accountType === 'traveller') {
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/users/traveler/liked-rooms`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ roomId: room.id, action })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.likedRooms) {
              localStorage.setItem("likedHomes", JSON.stringify(data.likedRooms));
              setLikedHomes(data.likedRooms);
            }
          }
        }
      } catch (err) {
        console.error('Error syncing liked rooms to MongoDB:', err);
      }
    }
  };

  const handleDateClick = (dateString) => {
    if (!isDateAvailable(dateString)) {
      showErrorMessage("Host is unavailable on this date. Please choose another day.");
      return;
    }

    if (!checkInDate) {
      setCheckInDate(dateString);
    } else if (!checkOutDate) {
      if (dateString <= checkInDate) {
        setCheckInDate(dateString);
        setCheckOutDate('');
      } else {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(dateString);
        for (let d = new Date(checkIn); d <= checkOut; d.setDate(d.getDate() + 1)) {
          const iso = new Date(d).toISOString().split('T')[0];
          if (!isDateAvailable(iso)) {
            showErrorMessage("Selected range includes unavailable dates. Please choose another range.");
            return;
          }
        }
        setCheckOutDate(dateString);
      }
    } else {
      setCheckInDate(dateString);
      setCheckOutDate('');
    }
  };

  const clearDates = () => {
    setCheckInDate('');
    setCheckOutDate('');
  };

  const isDateInRange = (dateString) => {
    if (!checkInDate || !checkOutDate) return false;
    const date = new Date(dateString);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    return date >= checkIn && date <= checkOut;
  };

  const isDateAvailable = (dateString) => {
    if (!room || !room.unavailableDates || room.unavailableDates.length === 0) {
      // Check if date is before today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(dateString);
      if (selectedDate < today) {
        return false;
      }
      return true;
    }
  
    const date = new Date(dateString).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    // Block dates before today
    if (date < today) {
      return false;
    }
    
    const blocked = room.unavailableDates.map(d => {
      const dd = new Date(d);
      return dd.toISOString().split('T')[0];
    });
  
    return !blocked.includes(date);
  };
  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRent = () => {
    if (!checkInDate || !checkOutDate) {
      showErrorMessage("Please select both check-in and check-out dates");
      return;
    }
  
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      showErrorMessage("Check-out date must be after check-in date");
      return;
    }
  
    const pricePerNight = parseFloat(room.price);
    const totalCost = days * pricePerNight * (1 - (room.discountPercentage || 0) / 100);
    
    navigate(
      `/payment?id=${room.id}` +
      `&checkIn=${checkInDate}` +
      `&checkOut=${checkOutDate}` +
      `&days=${days}` +
      `&cost=${totalCost}` +
      `&mail=${encodeURIComponent(room.host.email)}` +
      `&title=${encodeURIComponent(room.title)}` +
      `&location=${encodeURIComponent(room.location)}`
    );
  };


  const handleMessage = () => {
  
  if (!room) {
    showErrorMessage("Room information not loaded yet. Please wait...");
    return;
  }

  // Get host email from multiple possible locations
  // Try: room.host.email (from processRoomData), room.email (direct from API), or any nested location
  const hostEmail = (
    room?.host?.email || 
    room?.email || 
    room?.hostEmail ||
    ''
  ).trim();
  
  if (!hostEmail) {
    console.error('Host email missing in room data. Full room object:', room);
    console.error('Available fields:', {
      roomId: room?.id,
      roomEmail: room?.email,
      hostObject: room?.host,
      hostEmail: room?.host?.email,
      allKeys: room ? Object.keys(room) : []
    });
    showErrorMessage("Host email not available for this room. The host may need to update their profile.");
    return;
  }

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    navigate('/traveler-login', {
      state: {
        redirectTo: window.location.pathname,
        message: 'Please login to message the host'
      }
    });
    return;
  }
  
  navigate('/chat', {
    state: {
      startChatWith: {
        email: hostEmail,
        name: room.host?.name || 'Host',
        profilePhoto: room.host?.image || null
      }
    }
  });
};
  const getRentButtonText = () => {
    if (!checkInDate || !checkOutDate) return "Select Dates";
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return "Invalid Dates";
    
    const pricePerNight = parseFloat(room.price);
    const totalCost = days * pricePerNight * (1 - (room.discountPercentage || 0) / 100);
    return `Book Now for ${formatCurrency(totalCost)}`;
  };

  const isRentButtonDisabled = () => {
    if (!checkInDate || !checkOutDate) return true;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return days <= 0;
  };

  const renderCalendar = () => {
    const months = buildCalendarMonths(3);
    const currentMonth = months[currentMonthIndex];
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const today = new Date().toISOString().split('T')[0];

    return (
      <div 
        className="calendar-swipe-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={calendarRef}
      >
        <div className="calendar-header">
          <button 
            className="calendar-nav-button"
            onClick={handlePrevMonth}
            disabled={currentMonthIndex === 0}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className="calendar-title">
            <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '0.5rem' }} />
            {currentMonth.label}
          </div>
          <button 
            className="calendar-nav-button"
            onClick={handleNextMonth}
            disabled={currentMonthIndex === months.length - 1}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        <div className="calendar-weekdays">
          {weekdays.map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {currentMonth.days.map((dateStr, index) => {
            if (!dateStr) {
              return <div key={`empty-${index}`} className="calendar-day calendar-day-disabled" />;
            }

            const date = new Date(dateStr);
            const day = date.getDate();
            const isToday = dateStr === today;
            const isSelected = dateStr === checkInDate || dateStr === checkOutDate;
            const inRange = isDateInRange(dateStr);
            const available = isDateAvailable(dateStr);
            const isPast = dateStr < today; // Check if date is in the past

            let className = "calendar-day";
            if (isToday) className += " calendar-day-today";
            if (isSelected) className += " calendar-day-selected";
            if (inRange && !isSelected) className += " calendar-day-in-range";
            if (!available || isPast) className += " calendar-day-unavailable";

            return (
              <button
                key={dateStr}
                className={className}
                onClick={() => available && handleDateClick(dateStr)}
                disabled={!available || isPast}
                title={available && !isPast ? `Select ${formatDateDisplay(dateStr)}` : isPast ? 'Past date' : 'Not available'}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="calendar-dots">
          {months.map((_, index) => (
            <button
              key={index}
              className={`calendar-dot ${index === currentMonthIndex ? 'active' : ''}`}
              onClick={() => setCurrentMonthIndex(index)}
              aria-label={`Go to month ${index + 1}`}
            />
          ))}
        </div>

      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="room-loading">
          <div className="room-loading-spinner"></div>
          <p>Loading room details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error && typeof error === 'string' && !room) {
    return (
      <>
        <Navbar />
        <div className="room-room-details-container">
          <div className="room-global-error">
            <div className="room-error-content">
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span>{error}</span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!room) {
    return (
      <>
        <Navbar />
        <div className="room-room-details-container">
          <div className="room-global-error">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>Room not found</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isLiked = likedHomes.includes(room.id);

  return (
    <>
      <Navbar />
      
      {error && (
        <div className={`room-global-error ${error.type === 'success' ? 'room-success' : ''}`}>
          <div className="room-error-content">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>{error.message}</span>
          </div>
        </div>
      )}

      <div className="room-room-details-container">
        {/* Header */}
        <div className="room-header">
          <h1 className="room-title">{room.title}</h1>
          <div className="room-share-button-div">
            <button id="room-share-button" onClick={handleShare} aria-label="Share room">
              <FontAwesomeIcon icon={faShareAlt} />
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="room-gallery">
          {room.media && room.media.length > 0 ? (
            <>
              <div 
                className="room-main-image" 
                style={{ backgroundImage: `url('${room.media[currentImageIndex]}')` }}
              >
                <button 
                  className="room-image-nav" 
                  id="room-prev-image" 
                  onClick={handlePrevImage} 
                  aria-label="Previous image"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button 
                  className="room-image-nav" 
                  id="room-next-image" 
                  onClick={handleNextImage} 
                  aria-label="Next image"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
                <div className="room-image-counter">
                  {currentImageIndex + 1} / {room.media.length}
                </div>
              </div>
              <div className="room-thumbnails">
                {room.media.map((img, index) => (
                  <img 
                    key={index}
                    src={img} 
                    className={`room-thumbnail ${index === currentImageIndex ? 'room-active' : ''}`} 
                    alt={`Thumbnail ${index + 1}`}
                    onClick={() => handleThumbnailClick(index)}
                    loading="lazy"
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="room-main-image" style={{ backgroundImage: 'url(/images/placeholder.jpg)' }}>
              <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No images available</p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="room-container">
          {/* Left Side - Room Details */}
          <div className="room-left-side">
            {/* Description */}
            <div className="room-content-card">
              <h2>
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                Description
              </h2>
              <p>{room.description}</p>
            </div>

            {/* Amenities */}
            <div className="room-content-card">
              <h2>
                <FontAwesomeIcon icon={faWifi} />
                Amenities
              </h2>
              <ul className="room-amenities-grid">
                {Object.entries(room.amenities).map(([amenity, available]) => (
                  <li key={amenity}>
                    <span className="room-amenity-name">
                      {amenity === 'wifi' && <FontAwesomeIcon icon={faWifi} />}
                      {amenity === 'ac' && <FontAwesomeIcon icon={faSnowflake} />}
                      {amenity === 'hotWater' && <FontAwesomeIcon icon={faTint} />}
                      {amenity === 'carParking' && <FontAwesomeIcon icon={faCar} />}
                      {amenity === 'EvCharging' && <FontAwesomeIcon icon={faCar} />}
                      {amenity === 'laundry' && <FontAwesomeIcon icon={faTint} />}
                      {amenity === 'taps' && <FontAwesomeIcon icon={faTint} />}
                      {' '}
                      {amenity.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`room-amenity-status ${available ? 'available' : 'unavailable'}`}>
                      {available ? '✓ Available' : '✗ Not Available'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Room Information */}
            <div className="room-content-card">
              <h2>
                <FontAwesomeIcon icon={faUser} />
                Room Information
              </h2>
              <div className="room-info-grid">
                <div className="room-info-item">
                  <span className="room-info-label">Type of Host:</span>
                  <span className="room-info-value">{room.host.gen || 'Not specified'}</span>
                </div>
                <div className="room-info-item">
                  <span className="room-info-label">Food Facility:</span>
                  <span className="room-info-value">
                    <FontAwesomeIcon icon={faUtensils} /> {room.host.food || 'Not specified'}
                  </span>
                </div>
                <div className="room-info-item">
                  <span className="room-info-label">Room Location:</span>
                  <span className="room-info-value">{room.locationType || 'Not specified'}</span>
                </div>
                <div className="room-info-item">
                  <span className="room-info-label">Room Size:</span>
                  <span className="room-info-value">{room.size || 'Medium'}</span>
                </div>
                <div className="room-info-item">
                  <span className="room-info-label">Nearest Transport:</span>
                  <span className="room-info-value">{room.transport || 'Not specified'}</span>
                </div>
                <div className="room-info-item">
                  <span className="room-info-label">Max Stay Duration:</span>
                  <span className="room-info-value">{room.maxdays} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Booking */}
          <div className="room-right-side">
            {/* Booking Card */}
            <div className="room-booking-card">
              <div className="room-price-section">
                <div>
                  <div className="room-price">
                    {formatCurrency(room.price * (1 - (room.discountPercentage || 0) / 100))}
                  </div>
                  <div className="room-price-period">per night</div>
                </div>
              </div>

              {/* Calendar */}
              <div className="calendar-container">
                {renderCalendar()}
              </div>

              {/* Selected Dates */}
              {(checkInDate || checkOutDate) && (
                <div className="selected-dates-display">
                  <div className="selected-dates-info">
                    <div className="selected-dates-label">Selected Dates:</div>
                    <div className="selected-dates-value">
                      {checkInDate && formatDateDisplay(checkInDate)}
                      {checkOutDate && ` → ${formatDateDisplay(checkOutDate)}`}
                    </div>
                  </div>
                  <button className="clear-dates-button" onClick={clearDates}>
                    Clear
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="room-action-buttons">
                <button 
                  id="room-rent-button" 
                  className="room-action-button"
                  onClick={handleRent}
                  disabled={isRentButtonDisabled()}
                >
                  {getRentButtonText()}
                </button>
                <button 
                  id="room-save-button" 
                  className={`room-action-button ${isLiked ? 'room-liked' : ''}`}
                  onClick={handleSave}
                >
                  <FontAwesomeIcon icon={faHeart} /> 
                  {isLiked ? ' Remove from Wishlist' : ' Save to Wishlist'}
                </button>
              </div>
            </div>

            {/* Host Info */}
            <div className="room-host-card">
              <img 
                src={
                  room.host?.image && room.host.image.startsWith('http')
                    ? room.host.image
                    : room.host?.image && /^[0-9a-fA-F]{24}$/.test(room.host.image)
                    ? `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/images/${room.host.image}`
                    : '/images/logo.png'
                }
                alt={`${room.host?.name || 'Host'} profile`}
                className="room-host-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/logo.png';
                }}
              />
              <div className="room-host-details">
                <h3 className="room-host-name">Hosted by {room.host.name || 'Unknown'}</h3>
                {room.host.gen && (
                  <p className="room-host-meta">
                    <FontAwesomeIcon icon={faUser} /> {room.host.gen}
                  </p>
                )}
                {room.host.email && (
                  <p className="room-host-meta">
                    <FontAwesomeIcon icon={faEnvelope} /> {room.host.email}
                  </p>
                )}
                <button 
                  id="room-message-button"
                  onClick={handleMessage}
                >
                  <FontAwesomeIcon icon={faEnvelope} /> Message Host
                </button>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="room-map-section">
            <h2>
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              Location
            </h2>
            {room && (
              <RoomMap
                latitude={room.host.latitude}
                longitude={room.host.longitude}
                title={room.title}
                description={room.description}
                price={room.price}
              />
            )}
          </div>

        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default RoomLayout;