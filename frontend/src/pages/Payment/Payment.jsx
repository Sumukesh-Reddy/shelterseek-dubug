// components/Payment/EnhancedPayment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './Payment.css';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [roomData, setRoomData] = useState(null);
  const [guestDetails, setGuestDetails] = useState([{
    guestName: '',
    guestAge: '',
    guestGender: 'male',
    guestContact: '',
    govtIdType: 'aadhar',
    govtIdNumber: ''
  }]);
  // eslint-disable-next-line no-unused-vars
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  // eslint-disable-next-line no-unused-vars
  const [upiId, setUpiId] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  const roomId = searchParams.get('id');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const days = parseInt(searchParams.get('days')) || 1;
  const cost = parseFloat(searchParams.get('cost')) || 0;
  const hostEmail = searchParams.get('mail');
  const title = searchParams.get('title');
  const location = searchParams.get('location');

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setGuestDetails([{
            guestName: user.name || '',
            guestAge: '',
            guestGender: 'male',
            guestContact: user.email || '',
            govtIdType: 'aadhar',
            govtIdNumber: ''
          }]);
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/rooms`);
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          const room = result.data.find(r => r._id === roomId || r.id === roomId);
          if (room) {
            setRoomData(room);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching room data:', err);
    }
  };

  const formatCurrency = (number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(number);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone.replace(/\D/g, ''));
  };

  const validateContact = (contact) => {
    if (!contact) return false;
    return validateEmail(contact) || validatePhone(contact);
  };

  const validateGovtId = (idType, idNumber) => {
    if (!idNumber) return true; // Optional field
    
    const cleanId = idNumber.trim();
    if (!cleanId) return true;
    
    switch(idType) {
      case 'aadhar':
        return /^\d{12}$/.test(cleanId);
      case 'pan_card':
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanId);
      case 'passport':
        return /^[A-PR-WY][1-9]\d\s?\d{4}[1-9]$/.test(cleanId);
      case 'driving_license':
        return cleanId.length >= 5; // Basic validation
      case 'voter_id':
        return /^[A-Z]{3}[0-9]{7}$/.test(cleanId);
      default:
        return cleanId.length >= 3;
    }
  };

  // eslint-disable-next-line no-unused-vars
  const validateCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleaned)) return false;
    
    // Luhn algorithm validation
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return (sum % 10) === 0;
  };

  // eslint-disable-next-line no-unused-vars
  const validateExpiryDate = (month, year) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Validate year format and range
    if (!/^\d{4}$/.test(year)) return false;
    const expiryYear = parseInt(year, 10);
    
    if (expiryYear < currentYear || expiryYear > currentYear + 20) {
      return false;
    }
    
    // Validate month format and range
    if (!/^\d{1,2}$/.test(month)) return false;
    const expiryMonth = parseInt(month, 10);
    
    if (expiryMonth < 1 || expiryMonth > 12) {
      return false;
    }
    
    // Check if card is expired
    if (expiryYear === currentYear && expiryMonth < currentMonth) {
      return false;
    }
    
    return true;
  };

  // eslint-disable-next-line no-unused-vars
  const validateCVV = (cvv, cardType) => {
    if (!/^\d{3,4}$/.test(cvv)) return false;
    
    // American Express CVV is 4 digits, others are 3
    if (cardType === 'amex') {
      return cvv.length === 4;
    }
    return cvv.length === 3;
  };

  const handleAddGuest = () => {
    if (guestDetails.length >= (roomData?.capacity || 4)) {
      setError(`Maximum capacity is ${roomData?.capacity || 4} guests`);
      return;
    }
    setGuestDetails([...guestDetails, {
      guestName: '',
      guestAge: '',
      guestGender: 'male',
      guestContact: '',
      govtIdType: 'aadhar',
      govtIdNumber: ''
    }]);
    // Clear guest-specific errors
    setFormErrors(prev => {
      const newErrors = {...prev};
      Object.keys(newErrors).forEach(key => {
        if (key.includes('guest_')) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const handleRemoveGuest = (index) => {
    if (guestDetails.length === 1) return;
    const updatedGuests = [...guestDetails];
    updatedGuests.splice(index, 1);
    setGuestDetails(updatedGuests);
  };

  const handleGuestChange = (index, field, value) => {
    const updatedGuests = [...guestDetails];
    updatedGuests[index][field] = value;
    setGuestDetails(updatedGuests);
    
    // Clear specific error when user starts typing
    if (formErrors[`guest_${index}_${field}`]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[`guest_${index}_${field}`];
        return newErrors;
      });
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.substring(0, 16);
    value = value.replace(/(.{4})/g, '$1 ').trim();
    setCardDetails({...cardDetails, cardNumber: value});
    
    // Clear error when user starts typing
    if (formErrors.cardNumber) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.cardNumber;
        return newErrors;
      });
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleExpiryChange = (e, field) => {
    let value = e.target.value.replace(/\D/g, '');
    if (field === 'expiryMonth' && value.length > 2) value = value.substring(0, 2);
    if (field === 'expiryYear' && value.length > 4) value = value.substring(0, 4);
    setCardDetails({...cardDetails, [field]: value});
    
    // Clear error when user starts typing
    if (formErrors.expiryDate) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.expiryDate;
        return newErrors;
      });
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleCVVChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substring(0, 4);
    setCardDetails({...cardDetails, cvv: value});
    
    // Clear error when user starts typing
    if (formErrors.cvv) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.cvv;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate guest details
    for (let i = 0; i < guestDetails.length; i++) {
      const guest = guestDetails[i];
      
      // Name validation
      if (!guest.guestName.trim()) {
        errors[`guest_${i}_name`] = `Guest ${i + 1}: Name is required`;
      } else if (guest.guestName.trim().length < 2) {
        errors[`guest_${i}_name`] = `Guest ${i + 1}: Name must be at least 2 characters`;
      }
      
      // Age validation
      if (guest.guestAge) {
        const age = parseInt(guest.guestAge, 10);
        if (isNaN(age) || age < 0 || age > 120) {
          errors[`guest_${i}_age`] = `Guest ${i + 1}: Age must be between 0 and 120`;
        }
      }
      
      // Contact validation
      if (guest.guestContact) {
        if (!validateContact(guest.guestContact)) {
          errors[`guest_${i}_contact`] = `Guest ${i + 1}: Please enter a valid email or phone number`;
        }
      }
      
      // Government ID validation
      if (guest.govtIdNumber && !validateGovtId(guest.govtIdType, guest.govtIdNumber)) {
        let idName = '';
        switch(guest.govtIdType) {
          case 'aadhar': idName = 'Aadhar'; break;
          case 'pan_card': idName = 'PAN'; break;
          case 'passport': idName = 'Passport'; break;
          case 'driving_license': idName = 'Driving License'; break;
          case 'voter_id': idName = 'Voter ID'; break;
          default: idName = 'ID';
        }
        errors[`guest_${i}_id`] = `Guest ${i + 1}: Please enter a valid ${idName} number`;
      }
    }
    
    // Razorpay handles all payment method validation natively.
    
    // Special requests length validation
    if (specialRequests.length > 500) {
      errors.specialRequests = 'Special requests cannot exceed 500 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getCardType = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    if (/^35/.test(cleanNumber)) return 'jcb';
    if (/^60/.test(cleanNumber)) return 'rupay';
    return 'other';
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      setError('Please log in to complete the booking');
      setLoading(false);
      return;
    }

    const user = JSON.parse(userStr);

    const res = await loadRazorpay();
    if (!res) {
      setError('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order on the backend
      const orderResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalWithTax, currency: 'INR' })
      });
      
      const orderData = await orderResponse.json();
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to initialize payment');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: 'rzp_test_SO2HYyrhu02R9s', // Public key from env ideally, hardcoded here as requested
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'ShelterSeek',
        description: `Booking for ${title}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verifyRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              // 4. Create actual booking
              await submitBooking(response.razorpay_payment_id, token, user);
            } else {
              setError('Payment verification failed');
              setLoading(false);
            }
          } catch (err) {
            console.error('Verification error:', err);
            setError('Payment verification failed');
            setLoading(false);
          }
        },
        prefill: {
          name: user.name || guestDetails[0].guestName,
          email: user.email || guestDetails[0].guestContact,
          contact: guestDetails[0].guestContact,
        },
        theme: {
          color: '#e91e63'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        setError(response.error.description || 'Payment Failed');
        setLoading(false);
      });
      paymentObject.open();

    } catch (err) {
      console.error('Payment Error:', err);
      setError(err.message || 'Payment initialization failed');
      setLoading(false);
    }
  };

  const submitBooking = async (transactionId, token, user) => {
    try {
      const cardType = paymentMethod === 'credit_card' && cardDetails.cardNumber 
          ? getCardType(cardDetails.cardNumber.replace(/\s/g, '')) 
          : undefined;
      const cardLastFour = paymentMethod === 'credit_card' && cardDetails.cardNumber
          ? cardDetails.cardNumber.replace(/\s/g, '').slice(-4)
          : undefined;

      const bookingResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: roomId,
          checkIn: checkIn,
          checkOut: checkOut,
          days: days,
          totalCost: totalWithTax,
          hostEmail: hostEmail,
          guests: guestDetails.length,
          guestDetails: guestDetails.map(guest => ({
            ...guest,
            guestAge: guest.guestAge ? parseInt(guest.guestAge, 10) : null
          })),
          specialRequests: specialRequests,
          paymentDetails: {
            paymentMethod: 'razorpay', // Razorpay used for all methods
            ...(cardLastFour && { cardLastFour }),
            ...(cardType && { cardType }),
            transactionId: transactionId,
            paymentGateway: 'razorpay'
          }
        })
      });

      const bookingResult = await bookingResponse.json();

      if (!bookingResponse.ok) {
        setError(bookingResult.message || `HTTP Error: ${bookingResponse.status}`);
        setLoading(false);
        return;
      }

      if (bookingResult.success) {
        setCardDetails({ cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '' });
        setUpiId('');
        setSpecialRequests('');
        
        alert(`Booking confirmed!\nBooking ID: ${bookingResult.bookingId}\nTransaction ID: ${transactionId}`);
        
        const bookingInfo = {
          bookingId: bookingResult.bookingId,
          transactionId: transactionId,
          roomId: roomId,
          roomTitle: title,
          checkIn: checkIn,
          checkOut: checkOut,
          totalCost: totalWithTax,
          guests: guestDetails,
          bookedAt: new Date().toISOString()
        };
        
        const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        userBookings.push(bookingInfo);
        localStorage.setItem('userBookings', JSON.stringify(userBookings));
        
        navigate('/BookedHistory');
      } else {
        setError(bookingResult.message || 'Failed to complete booking');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setError('An error occurred while saving the booking.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate costs
  const roomPricePerNight = roomData?.price || (cost / days);
  const discount = roomData?.discount || 0;
  const subtotal = roomPricePerNight * days;
  const discountAmount = subtotal * (discount / 100);
  const finalCost = subtotal - discountAmount;
  const displayCost = cost > 0 ? cost : finalCost;
  const tax = displayCost * 0.18; // 18% GST
  const totalWithTax = displayCost + tax;

  if (!checkIn || !checkOut || !roomId) {
    return (
      <>
        <Navbar />
        <div className="payment-container">
          <div className="payment-error">
            <h2>Invalid Booking Information</h2>
            <p>Please select dates from the room page to proceed with booking.</p>
            <button onClick={() => navigate('/')}>Go to Home</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="payment-container">
        <div className="payment-content">
          <div className="payment-left">
            <h1>Booking Summary</h1>
            
            <div className="booking-details-card">
              <h2>{title || 'Property Booking'}</h2>
              <p className="location">{location || 'Location'}</p>
              
              <div className="booking-dates">
                <div className="date-item">
                  <strong>Check-in:</strong>
                  <span>{formatDate(checkIn)}</span>
                </div>
                <div className="date-item">
                  <strong>Check-out:</strong>
                  <span>{formatDate(checkOut)}</span>
                </div>
                <div className="date-item">
                  <strong>Duration:</strong>
                  <span>{days} night{days !== 1 ? 's' : ''}</span>
                </div>
                <div className="date-item">
                  <strong>Guests:</strong>
                  <span>{guestDetails.length}</span>
                </div>
              </div>

              {roomData && (
                <div className="room-details">
                  <h3>Room Details</h3>
                  <div className="detail-row">
                    <span>Property Type:</span>
                    <span>{roomData.propertyType || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Capacity:</span>
                    <span>{roomData.capacity || 'N/A'} guests</span>
                  </div>
                  <div className="detail-row">
                    <span>Bedrooms:</span>
                    <span>{roomData.bedrooms || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Beds:</span>
                    <span>{roomData.beds || 'N/A'}</span>
                  </div>
                </div>
              )}

              {/* Guest Information Section */}
              <div className="guest-section">
                <h3>Guest Information</h3>
                {guestDetails.map((guest, index) => (
                  <div key={index} className="guest-card">
                    <div className="guest-header">
                      <h4>Guest {index + 1} {index === 0 && '(Primary)'}</h4>
                      {guestDetails.length > 1 && (
                        <button 
                          type="button" 
                          className="remove-guest-btn"
                          onClick={() => handleRemoveGuest(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="guest-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Full Name *</label>
                          <input
                            type="text"
                            value={guest.guestName}
                            onChange={(e) => handleGuestChange(index, 'guestName', e.target.value)}
                            placeholder="Enter full name"
                            className={formErrors[`guest_${index}_name`] ? 'error' : ''}
                            required
                          />
                          {formErrors[`guest_${index}_name`] && (
                            <span className="error-message">{formErrors[`guest_${index}_name`]}</span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Age</label>
                          <input
                            type="number"
                            value={guest.guestAge}
                            onChange={(e) => handleGuestChange(index, 'guestAge', e.target.value)}
                            placeholder="Age"
                            min="0"
                            max="120"
                            className={formErrors[`guest_${index}_age`] ? 'error' : ''}
                          />
                          {formErrors[`guest_${index}_age`] && (
                            <span className="error-message">{formErrors[`guest_${index}_age`]}</span>
                          )}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Gender</label>
                          <select
                            value={guest.guestGender}
                            onChange={(e) => handleGuestChange(index, 'guestGender', e.target.value)}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Contact</label>
                          <input
                            type="text"
                            value={guest.guestContact}
                            onChange={(e) => handleGuestChange(index, 'guestContact', e.target.value)}
                            placeholder="Email or phone"
                            className={formErrors[`guest_${index}_contact`] ? 'error' : ''}
                          />
                          {formErrors[`guest_${index}_contact`] && (
                            <span className="error-message">{formErrors[`guest_${index}_contact`]}</span>
                          )}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>ID Type</label>
                          <select
                            value={guest.govtIdType}
                            onChange={(e) => handleGuestChange(index, 'govtIdType', e.target.value)}
                          >
                            <option value="aadhar">Aadhar Card</option>
                            <option value="passport">Passport</option>
                            <option value="driving_license">Driving License</option>
                            <option value="voter_id">Voter ID</option>
                            <option value="pan_card">PAN Card</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>ID Number</label>
                          <input
                            type="text"
                            value={guest.govtIdNumber}
                            onChange={(e) => handleGuestChange(index, 'govtIdNumber', e.target.value)}
                            placeholder="ID number"
                            className={formErrors[`guest_${index}_id`] ? 'error' : ''}
                          />
                          {formErrors[`guest_${index}_id`] && (
                            <span className="error-message">{formErrors[`guest_${index}_id`]}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {guestDetails.length < (roomData?.capacity || 4) && (
                  <button 
                    type="button" 
                    className="add-guest-btn"
                    onClick={handleAddGuest}
                  >
                    + Add Another Guest
                  </button>
                )}
              </div>

              {/* Special Requests */}
              <div className="special-requests">
                <h3>Special Requests</h3>
                <textarea
                  value={specialRequests}
                  onChange={(e) => {
                    setSpecialRequests(e.target.value);
                    if (formErrors.specialRequests) {
                      setFormErrors(prev => {
                        const newErrors = {...prev};
                        delete newErrors.specialRequests;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Any special requirements, dietary restrictions, or additional notes..."
                  rows="3"
                  className={formErrors.specialRequests ? 'error' : ''}
                />
                <div className="char-count">
                  {specialRequests.length}/500 characters
                </div>
                {formErrors.specialRequests && (
                  <span className="error-message">{formErrors.specialRequests}</span>
                )}
              </div>
            </div>
          </div>

          <div className="payment-right">
            <div className="payment-card">
              <h2>Payment Details</h2>
              
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Price per night:</span>
                  <span>{formatCurrency(roomPricePerNight)}</span>
                </div>
                <div className="price-row">
                  <span>Nights:</span>
                  <span>{days}</span>
                </div>
                <div className="price-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="price-row discount">
                    <span>Discount ({discount}%):</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="price-row">
                  <span>GST (18%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="price-row total">
                  <span><strong>Total Amount:</strong></span>
                  <span><strong>{formatCurrency(totalWithTax)}</strong></span>
                </div>
              </div>


              <p className="payment-note" style={{ marginTop: '20px', color: '#666', fontStyle: 'italic' }}>
                Note: You will be redirected to Razorpay's secure checkout overlay to enter your payment details.
              </p>

              {error && (
                <div className="payment-error-message">
                  {error}
                </div>
              )}

              <button 
                className="payment-button" 
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Pay ${formatCurrency(totalWithTax)}`}
              </button>

              <p className="payment-note">
                By confirming, you agree to our terms and conditions. 
                Your payment is secure and encrypted.
              </p>
            </div>

            <div className="host-contact">
              <h3>Host Contact</h3>
              <p>Email: {hostEmail || 'N/A'}</p>
              <button 
                className="contact-host-button"
                onClick={() => navigate('/message', { 
                  state: { 
                    hostEmail: hostEmail,
                    hostName: roomData?.name || 'Host'
                  }
                })}
              >
                Message Host
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Payment;