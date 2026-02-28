import React, { useEffect, useMemo, useState } from 'react';

import './HostRequests.css';


function sanitizeString(value) {
  if (typeof value !== 'string') return '';
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

export default function HostRequests() {
  const API_BASE = 'http://localhost:3001';
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError('');
        const url = `${API_BASE}/api/rooms/listings`;

        console.log('Fetching listings from:', url);
        const response = await fetch(url);
        const contentType = response.headers.get('content-type') || '';
        if (!response.ok) {
          if (contentType.includes('application/json')) {
            const errJson = await response.json();
            throw new Error(errJson.message || 'Failed to load listings');
          }
          const text = await response.text();
          throw new Error(text ? text.slice(0, 120) : 'Failed to load listings');
        }
        if (!contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Unexpected response (not JSON). First chars: ${text.slice(0, 60)}`);
        }
        const json = await response.json();
        console.log('Listings response:', json);
        const list = (json && json.data && json.data.listings) || [];
        setRequests(list);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err.message || 'Failed to load data');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [API_BASE]);

  const onOpen = (req) => setSelected(req);
  const onClose = () => setSelected(null);

  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    try {
      const created = new Date(dateStr).getTime();
      return Date.now() - created >= ninetyDaysMs;
    } catch {
      return false;
    }
  };

  const matchesStatus = (status, filterValue) => {
    const normalized = (status || 'pending').toLowerCase();
    if (filterValue === 'accepted') return normalized === 'verified' || normalized === 'approved';
    return normalized === filterValue;
  };

  const isBooked = (bookingValue) =>
    bookingValue !== undefined && ['true', true, 1, '1', 'yes', 'YES'].includes(bookingValue);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (requests || [])
      .filter((r) => matchesStatus(r.status, statusFilter))
      .filter((r) => {
        if (!term) return true;
        return (
          (r.name && r.name.toLowerCase().includes(term)) ||
          (r.title && r.title.toLowerCase().includes(term))
        );
      });
  }, [requests, search, statusFilter]);

  const updateStatus = async (listingId, nextStatus) => {
    try {
      console.log('Updating status:', { listingId, nextStatus });
  
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Missing admin token. Please log in again.');
      }
      
      // Map status for backend
      const statusMap = {
        'Approved': 'verified',
        'Rejected': 'rejected',
        'pending': 'pending'
      };
      
      const backendStatus = statusMap[nextStatus] || 'pending';
  
      const response = await fetch(`${API_BASE}/api/rooms/listings/${listingId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: backendStatus })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Failed to update status: ${response.status}`);
      }
      
      const json = await response.json();
      console.log('Update response:', json);
      
      if (!json.success) {
        throw new Error(json.message || 'Update failed');
      }
      
      const updated = json.data?.listing || { ...selected, status: backendStatus };
      
      // Update the local state
      setRequests((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setSelected(updated);
      
      // Show success message
      alert(`Status updated to ${nextStatus} successfully!`);
      
    } catch (err) {
      console.error('Update status error:', err);
      alert(err.message || 'Status update failed. Please try again.');
    }
  };

  return (
    <div className="host-requests-page">
      <div className="host-requests-container">
        <h1>Host Requests</h1>
        <div className="status-filter">
          <button
            className={`status-filter-btn${statusFilter === 'pending' ? ' active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`status-filter-btn${statusFilter === 'accepted' ? ' active' : ''}`}
            onClick={() => setStatusFilter('accepted')}
          >
            Accepted
          </button>
          <button
            className={`status-filter-btn${statusFilter === 'rejected' ? ' active' : ''}`}
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected
          </button>
        </div>
        <div className="search-container">
          <input
            id="search-bar"
            placeholder="Search by host name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {error && <div className="error-message">Error: {error}</div>}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : (
          <div className="host-requests-list">
            {visible.length === 0 ? (
              <p className="no-results">No hosts found. Try a different host name.</p>
            ) : (
              visible.map((request, index) => {
                const expired = isExpired(request.createdAt);
                const booked = isBooked(request.booking);
                const firstImageId = Array.isArray(request.images) && request.images.length > 0 ? request.images[0] : null;
                const imageSrc = firstImageId ? `${API_BASE}/api/images/${firstImageId}` : '/images/placeholder.png';
                const currentStatus = (request.status || 'pending').toLowerCase();
                return (
                  <div
                    key={request._id || index}
                    className={`host-request-card${expired ? ' expired' : ''}`}
                    onClick={() => onOpen(request)}
                  >
                    <img src={imageSrc} alt={sanitizeString(request.title) || 'Listing'} loading="lazy" />
                    <h3>
                      {sanitizeString(request.title) || 'No title'}
                      {expired && <span className="badge expired-badge">Expired</span>}
                      {booked && <span className="badge booked-badge">Booked</span>}
                    </h3>
                    <p>{`Name: ${sanitizeString(request.name) || 'Unknown'}`}</p>
                    <p className={`status ${currentStatus}${expired ? ' expired' : ''}`}>{`Status: ${sanitizeString(request.status) || 'pending'}`}</p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {selected && (
        <div className="modal" onClick={(e) => e.target.classList.contains('modal') && onClose()}>
          <div className="modal-content">
            <span className="close-modal" onClick={onClose}>×</span>
            <h2 id="modal-host-name">{sanitizeString(selected.title) || 'Host Details'}</h2>
            <p><strong>Name:</strong> <span id="modal-host-name-text">{sanitizeString(selected.name) || 'Unknown'}</span></p>
            <p><strong>Email:</strong> <span id="modal-host-email">{sanitizeString(selected.email) || 'No email'}</span></p>
            <p><strong>Title:</strong> <span id="modal-host-title">{sanitizeString(selected.title) || 'No title'}</span></p>
            <p><strong>Description:</strong> <span id="modal-host-description">{sanitizeString(selected.description) || 'No description'}</span></p>
            <p><strong>Price:</strong> <span id="modal-host-price">{selected.price ? `₹${sanitizeString(String(selected.price))}/night` : 'N/A'}</span></p>
            <p><strong>Location:</strong> <span id="modal-host-location">{sanitizeString(selected.location) || 'N/A'}</span></p>
            <p><strong>Property Type:</strong> <span id="modal-host-property-type">{sanitizeString(selected.propertyType) || 'N/A'}</span></p>
            <p><strong>Capacity:</strong> <span id="modal-host-capacity">{String(selected.capacity ?? '') || 'N/A'}</span></p>
            <p><strong>Room Type:</strong> <span id="modal-host-room-type">{sanitizeString(selected.roomType) || 'N/A'}</span></p>
            <p><strong>Bedrooms:</strong> <span id="modal-host-bedrooms">{String(selected.bedrooms ?? '') || 'N/A'}</span></p>
            <p><strong>Beds:</strong> <span id="modal-host-beds">{String(selected.beds ?? '') || 'N/A'}</span></p>
            <p><strong>Room Size:</strong> <span id="modal-host-room-size">{sanitizeString(selected.roomSize) || 'N/A'}</span></p>
            <p><strong>Room Location:</strong> <span id="modal-host-room-location">{sanitizeString(selected.roomLocation || '') || 'N/A'}</span></p>
            <p><strong>Transport Distance:</strong> <span id="modal-host-transport-distance">{sanitizeString(selected.transportDistance || '') || 'N/A'}</span></p>
            <p><strong>Host Gender:</strong> <span id="modal-host-gender">{sanitizeString(selected.hostGender || '') || 'N/A'}</span></p>
            <p><strong>Food Facility:</strong> <span id="modal-host-food-facility">{sanitizeString(selected.foodFacility || '') || 'N/A'}</span></p>
            <p><strong>Amenities:</strong> <span id="modal-host-amenities">{Array.isArray(selected.amenities) ? selected.amenities.join(', ') : sanitizeString(selected.amenities || '')}</span></p>
            <p><strong>Discount:</strong> <span id="modal-host-discount">{String(selected.discount ?? '') || 'N/A'}</span></p>
            <p><strong>Max Days:</strong> <span id="modal-host-maxdays">{String(selected.maxdays ?? '') || 'N/A'}</span></p>
            <p><strong>Unavailable Dates:</strong> <span id="modal-host-unavailable-dates">
              {Array.isArray(selected.unavailableDates) && selected.unavailableDates.length > 0 
                ? selected.unavailableDates.map((date, idx) => {
                    try {
                      const dateObj = new Date(date);
                      return dateObj.toLocaleDateString();
                    } catch {
                      return String(date);
                    }
                  }).join(', ')
                : 'N/A'}
            </span></p>
            <p><strong>Created At:</strong> <span id="modal-host-created-at">{sanitizeString(String(selected.createdAt || '')) || 'N/A'}</span></p>
            <div id="modal-media" className="modal-media">
              <div className="image-carousel">
                {Array.isArray(selected.images) && selected.images.length > 0 ? (
                  selected.images.map((imgId, i) => (
                    <img
                      key={i}
                      src={`${API_BASE}/api/images/${imgId}`}
                      alt={`Listing view ${i + 1} - ${sanitizeString(selected.title) || 'Host Request'}`}
                      loading="lazy"
                    />
                  ))
                ) : (
                  <img src="/images/placeholder.png" alt="Listing placeholder" loading="lazy" />
                )}
              </div>
            </div>
            <div className="modal-actions">
              <select
                id="modal-host-status"
                value={(selected.status || 'pending')}
                onChange={(e) => setSelected({ ...selected, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="verified">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                className="accept"
                onClick={() => updateStatus(selected._id, 'Approved')}
                disabled={isExpired(selected.createdAt) || isBooked(selected.booking)}
              >
                Accept
              </button>
              <button
                className="reject"
                onClick={() => updateStatus(selected._id, 'Rejected')}
                disabled={isExpired(selected.createdAt) || isBooked(selected.booking)}
              >
                Reject
              </button>
            </div>
            {isBooked(selected.booking) && (
              <div className="booked-notice">
                This room is currently booked. Accept/Reject is temporarily disabled.
              </div>
            )}
            {isExpired(selected.createdAt) && (
              <div className="expired-notice">
                This listing is older than 3 months and has been automatically rejected. Approval is disabled.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


