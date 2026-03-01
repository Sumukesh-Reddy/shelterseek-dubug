import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL, { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import './ManagerListings.css';

const normalizeImageUrl = (image) => {
  if (!image) {
    return '';
  }

  if (typeof image === 'object' && image.$oid) {
    return `${API_BASE_URL}/api/images/${image.$oid}`;
  }

  if (String(image).startsWith('http')) {
    return String(image);
  }

  if (String(image).startsWith('/api/images/')) {
    return `${API_BASE_URL}${image}`;
  }

  return `${API_BASE_URL}/api/images/${image}`;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const statusClassMap = {
  verified: 'verified',
  pending: 'pending',
  rejected: 'rejected'
};

const ManagerListings = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({
    totalActiveListings: 0,
    pendingApproval: 0,
    rejectedListings: 0,
    newListingsThisWeek: 0
  });
  const [filters, setFilters] = useState({ locations: [], propertyTypes: [] });
  const [pendingQueue, setPendingQueue] = useState([]);
  const [recentlyApproved, setRecentlyApproved] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [submittingAction, setSubmittingAction] = useState('');

  const fetchListingsDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_ENDPOINTS.MANAGERS.LISTINGS, {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('token') || ''}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to load listings dashboard');
      }

      const nextListings = data?.data?.listings || [];
      setListings(nextListings);
      setStats(data?.stats || {});
      setFilters(data?.filters || { locations: [], propertyTypes: [] });
      setPendingQueue(data?.data?.pendingQueue || []);
      setRecentlyApproved(data?.data?.recentlyApproved || []);
      setSelectedListing((currentSelection) => {
        if (!currentSelection?._id) {
          return currentSelection;
        }

        return nextListings.find((listing) => listing._id === currentSelection._id) || currentSelection;
      });
    } catch (fetchError) {
      console.error('Failed to load manager listings dashboard:', fetchError);
      setError(fetchError.message || 'Failed to load listings dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListingsDashboard();
  }, []);

  const filteredListings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return listings.filter((listing) => {
      const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
      const matchesLocation = locationFilter === 'all' || listing.location === locationFilter;
      const matchesPropertyType = propertyTypeFilter === 'all' || listing.propertyType === propertyTypeFilter;
      const matchesSearch =
        !normalizedSearch ||
        String(listing.title || '').toLowerCase().includes(normalizedSearch) ||
        String(listing.name || '').toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesLocation && matchesPropertyType && matchesSearch;
    });
  }, [listings, statusFilter, locationFilter, propertyTypeFilter, searchTerm]);

  const handleStatusUpdate = async (listingId, nextStatus) => {
    setSubmittingAction(`${listingId}:${nextStatus}`);
    setActionMessage('');

    try {
      const response = await fetch(API_ENDPOINTS.MANAGERS.LISTING_STATUS(listingId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to update listing status');
      }

      setActionMessage(data?.message || 'Listing updated successfully');
      if (selectedListing?._id === listingId) {
        setSelectedListing(data?.data?.listing || null);
      }
      await fetchListingsDashboard();
    } catch (updateError) {
      console.error('Failed to update listing status:', updateError);
      setError(updateError.message || 'Failed to update listing status');
    } finally {
      setSubmittingAction('');
    }
  };

  const handleDeleteListing = async (listingId) => {
    const shouldDelete = window.confirm('Delete this listing permanently? This cannot be undone.');
    if (!shouldDelete) {
      return;
    }

    setSubmittingAction(`${listingId}:delete`);
    setActionMessage('');

    try {
      const response = await fetch(API_ENDPOINTS.MANAGERS.LISTING_DELETE(listingId), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('token') || ''}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to delete listing');
      }

      setActionMessage(data?.message || 'Listing deleted successfully');
      if (selectedListing?._id === listingId) {
        setSelectedListing(null);
      }
      await fetchListingsDashboard();
    } catch (deleteError) {
      console.error('Failed to delete listing:', deleteError);
      setError(deleteError.message || 'Failed to delete listing');
    } finally {
      setSubmittingAction('');
    }
  };

  return (
    <div className="manager-listings-page">
      <div className="manager-listings-shell">
        <aside className="manager-sidebar">
          <div className="manager-sidebar-brand">
            <p className="manager-listings-kicker">Manager Desk</p>
            <h2>Listings Console</h2>
            <p>Navigation and account controls for listings operations.</p>
          </div>

          <div className="manager-sidebar-account">
            <span className="manager-listings-panel-label">Signed in as</span>
            <strong>{user?.name || 'Manager'}</strong>
            <span className="manager-listings-department-tag">{user?.department || 'Listings'}</span>
          </div>

          <nav className="manager-sidebar-nav" aria-label="Manager navigation">
            <button type="button" className="active" disabled>
              Listings Dashboard
            </button>
            <button type="button" onClick={() => navigate('/manager/profile')}>
              Profile
            </button>
            <button type="button" onClick={() => navigate('/manager')}>
              Workspace
            </button>
            <button type="button" className="logout" onClick={logout}>
              Logout
            </button>
          </nav>
        </aside>

        <main className="manager-listings-content">
          <header className="manager-listings-hero">
            <div className="manager-listings-hero-copy">
              <p className="manager-listings-kicker">Listings Control Desk</p>
              <h1>Listings Manager Workspace</h1>
              <p className="manager-listings-subtitle">
                Review, verify, reject, and remove property listings from one place.
              </p>
            </div>
          </header>

          {(error || actionMessage) && (
            <div className={`manager-listings-banner ${error ? 'error' : 'success'}`}>
              {error || actionMessage}
            </div>
          )}

          <section className="manager-listings-stats-grid">
            <article className="manager-stat-card">
              <span>Total Active Listings</span>
              <strong>{stats.totalActiveListings || 0}</strong>
            </article>
            <article className="manager-stat-card">
              <span>Pending Approval</span>
              <strong>{stats.pendingApproval || 0}</strong>
            </article>
            <article className="manager-stat-card">
              <span>Rejected Listings</span>
              <strong>{stats.rejectedListings || 0}</strong>
            </article>
            <article className="manager-stat-card">
              <span>New Listings This Week</span>
              <strong>{stats.newListingsThisWeek || 0}</strong>
            </article>
          </section>

          <div className="manager-listings-grid">
            <section className="manager-listings-main">
              <div className="manager-listings-toolbar">
                <div className="manager-listings-toolbar-title">
                  <h2>Listings Table</h2>
                  <p>{filteredListings.length} matching listings</p>
                </div>
                <div className="manager-listings-filters">
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by property or host name"
                  />
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="all">All Statuses</option>
                    <option value="verified">verified</option>
                    <option value="pending">pending</option>
                    <option value="rejected">rejected</option>
                  </select>
                  <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
                    <option value="all">All Locations</option>
                    {filters.locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  <select value={propertyTypeFilter} onChange={(event) => setPropertyTypeFilter(event.target.value)}>
                    <option value="all">All Property Types</option>
                    {filters.propertyTypes.map((propertyType) => (
                      <option key={propertyType} value={propertyType}>
                        {propertyType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="manager-listings-table-wrap">
                {loading ? (
                  <div className="manager-listings-empty">Loading listings...</div>
                ) : filteredListings.length === 0 ? (
                  <div className="manager-listings-empty">No listings match the current filters.</div>
                ) : (
                  <table className="manager-listings-table">
                    <thead>
                      <tr>
                        <th>Property Name</th>
                        <th>Host Name</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredListings.map((listing) => (
                        <tr key={listing._id}>
                          <td>
                            <strong>{listing.title || 'Untitled Listing'}</strong>
                            <span>{formatDate(listing.createdAt)}</span>
                          </td>
                          <td>{listing.name || 'Unknown Host'}</td>
                          <td>{listing.location || 'N/A'}</td>
                          <td>{listing.propertyType || listing.roomType || 'N/A'}</td>
                          <td>{formatCurrency(listing.price)}</td>
                          <td>
                            <span className={`manager-status-chip ${statusClassMap[listing.status] || 'pending'}`}>
                              {listing.status || 'pending'}
                            </span>
                          </td>
                          <td>
                            <div className="manager-table-actions">
                              <button type="button" onClick={() => setSelectedListing(listing)}>
                                View
                              </button>
                              <button
                                type="button"
                                className="approve"
                                disabled={listing.status === 'verified' || submittingAction === `${listing._id}:approved`}
                                onClick={() => handleStatusUpdate(listing._id, 'approved')}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="reject"
                                disabled={listing.status === 'rejected' || submittingAction === `${listing._id}:rejected`}
                                onClick={() => handleStatusUpdate(listing._id, 'rejected')}
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                className="delete"
                                disabled={submittingAction === `${listing._id}:delete`}
                                onClick={() => handleDeleteListing(listing._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            <aside className="manager-listings-side">
              <section className="manager-side-card">
                <div className="manager-side-card-header">
                  <h3>Pending Approvals Queue</h3>
                  <span>{pendingQueue.length}</span>
                </div>
                {pendingQueue.length === 0 ? (
                  <p className="manager-side-empty">No pending approvals right now.</p>
                ) : (
                  <ul>
                    {pendingQueue.map((listing) => (
                      <li key={listing._id}>
                        <button type="button" onClick={() => setSelectedListing(listing)}>
                          <strong>{listing.title || 'Untitled Listing'}</strong>
                          <span>{listing.name || 'Unknown Host'}</span>
                          <small>{listing.location || 'N/A'}</small>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="manager-side-card">
                <div className="manager-side-card-header">
                  <h3>Recently Approved</h3>
                  <span>{recentlyApproved.length}</span>
                </div>
                {recentlyApproved.length === 0 ? (
                  <p className="manager-side-empty">No approved listings yet.</p>
                ) : (
                  <ul>
                    {recentlyApproved.map((listing) => (
                      <li key={listing._id}>
                        <button type="button" onClick={() => setSelectedListing(listing)}>
                          <strong>{listing.title || 'Untitled Listing'}</strong>
                          <span>{listing.name || 'Unknown Host'}</span>
                          <small>{formatDate(listing.reviewedAt || listing.statusUpdatedAt || listing.createdAt)}</small>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="manager-side-card muted">
                <div className="manager-side-card-header">
                  <h3>Flagged / Reported Listings</h3>
                  <span>Skipped</span>
                </div>
                <p className="manager-side-empty">
                  Reporting and flag tracking are intentionally excluded in this version.
                </p>
              </section>
            </aside>
          </div>
        </main>
      </div>

      {selectedListing && (
        <div className="manager-listing-modal-backdrop" onClick={() => setSelectedListing(null)}>
          <div className="manager-listing-modal" onClick={(event) => event.stopPropagation()}>
            <div className="manager-listing-modal-header">
              <div>
                <p className="manager-listings-kicker">Listing Detail</p>
                <h2>{selectedListing.title || 'Untitled Listing'}</h2>
              </div>
              <button type="button" className="close" onClick={() => setSelectedListing(null)}>
                Close
              </button>
            </div>

            <div className="manager-listing-modal-grid">
              <div className="manager-listing-gallery">
                {(selectedListing.images || []).length > 0 ? (
                  (selectedListing.images || []).map((image, index) => (
                    <img
                      key={`${selectedListing._id}-${index}`}
                      src={normalizeImageUrl(image)}
                      alt={`${selectedListing.title || 'Listing'} ${index + 1}`}
                    />
                  ))
                ) : (
                  <div className="manager-gallery-empty">No photos uploaded</div>
                )}
              </div>

              <div className="manager-listing-facts">
                <div className="manager-fact-grid">
                  <div>
                    <span>Host</span>
                    <strong>{selectedListing.name || 'Unknown Host'}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{selectedListing.email || 'N/A'}</strong>
                  </div>
                  <div>
                    <span>Location</span>
                    <strong>{selectedListing.location || 'N/A'}</strong>
                  </div>
                  <div>
                    <span>Type</span>
                    <strong>{selectedListing.propertyType || selectedListing.roomType || 'N/A'}</strong>
                  </div>
                  <div>
                    <span>Price</span>
                    <strong>{formatCurrency(selectedListing.price)}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{selectedListing.status || 'pending'}</strong>
                  </div>
                </div>

                <div className="manager-description-card">
                  <span>Description</span>
                  <p>{selectedListing.description || 'No description provided.'}</p>
                </div>

                <div className="manager-description-card">
                  <span>Amenities</span>
                  <p>
                    {(selectedListing.amenities || []).length > 0
                      ? selectedListing.amenities.join(', ')
                      : 'No amenities listed.'}
                  </p>
                </div>

                <div className="manager-modal-actions">
                  <button
                    type="button"
                    className="approve"
                    disabled={selectedListing.status === 'verified' || submittingAction === `${selectedListing._id}:approved`}
                    onClick={() => handleStatusUpdate(selectedListing._id, 'approved')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="reject"
                    disabled={selectedListing.status === 'rejected' || submittingAction === `${selectedListing._id}:rejected`}
                    onClick={() => handleStatusUpdate(selectedListing._id, 'rejected')}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="delete"
                    disabled={submittingAction === `${selectedListing._id}:delete`}
                    onClick={() => handleDeleteListing(selectedListing._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerListings;
