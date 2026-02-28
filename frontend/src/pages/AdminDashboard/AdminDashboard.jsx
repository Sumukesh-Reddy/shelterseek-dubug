import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar/navbar';
import './AdminDashboard.css';
import { useAuth } from '../../contexts/AuthContext';
function AdminDashboard() {
  // data state
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [totalBookings, setTotalBookings] = useState(0);
  const [thisMonthBookings, setThisMonthBookings] = useState(0);
  const [thisWeekBookings, setThisWeekBookings] = useState(0);
  const [newCustomers, setNewCustomers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0.0);
  const [thisMonthRevenue, setThisMonthRevenue] = useState(0.0);
  const [thisWeekRevenue, setThisWeekRevenue] = useState(0.0);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Room counts state extended with shared/full
  const [roomCounts, setRoomCounts] = useState({
    total: 0,
    available: 0,
    booked: 0,
    thisMonthBooked: 0,
    thisWeekBooked: 0
  });
  const [loadingRooms, setLoadingRooms] = useState(true);

  // NEW
  const [roomTypeCounts, setRoomTypeCounts] = useState({
    shared: 0,
    full: 0
  });

  // fetch data
  useEffect(() => {
   // Fetch booking summary (list)
fetch('http://localhost:3001/api/bookings/summarys')
.then(res => res.json())
.then(response => {
  if (response.success && Array.isArray(response.bookings)) {
    setBookings(response.bookings);
  } else {
    setBookings([]);
  }
})
.catch(err => {
  console.error('Error fetching booking summary:', err);
  setBookings([]);
});

// Fetch room counts
fetch('http://localhost:3001/api/rooms/count')
.then(res => res.json())
.then(data => {
  if (data.success) {
    setRoomCounts(data.counts);
    
    let shared = 0;
    let full = 0;
    
    if (Array.isArray(data.popularTypes)) {
      data.popularTypes.forEach((t) => {
        if (/shared/i.test(t._id)) {
          shared = t.count;
        } else if (/full/i.test(t._id)) {
          full = t.count;
        }
      });
    }
    
    setRoomTypeCounts({ shared, full });
  }
})
.catch(err => console.error('Error fetching room counts:', err))
.finally(() => setLoadingRooms(false));

// Fetch new customers - UPDATED URL
fetch('http://localhost:3001/api/admin/new-customers', {
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
})
.then(res => res.json())
.then(result => {
  if (result.success && Array.isArray(result.data)) {
    setNewCustomers(result.data);
  } else {
    setNewCustomers([]);
  }
})
.catch((err) => {
  console.error('Error fetching new customers:', err);
  setNewCustomers([]);
});

// Fetch recent activities - UPDATED URL
fetch('http://localhost:3001/api/admin/recent-activities', {
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
})
.then(res => res.json())
.then(result => {
  if (Array.isArray(result?.data)) setRecentActivities(result.data);
  else if (Array.isArray(result)) setRecentActivities(result);
  else setRecentActivities([]);
})
.catch(() => setRecentActivities([]));

// Fetch revenue - UPDATED URL
fetch('http://localhost:3001/api/admin/revenue', {
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
})
.then(res => res.json())
.then(data => {
  if (data) {
    setTotalRevenue(data.totalRevenue ?? 0);
    setThisMonthRevenue(data.thisMonthRevenue ?? 0);
    setThisWeekRevenue(data.thisWeekRevenue ?? 0);
  }
})
.catch(() => {});

// Fetch booking counts (these are public, no auth needed)
fetch('http://localhost:3001/api/bookings/summary')
.then(res => res.json())
.then(data => {
  if (data) {
    setTotalBookings(data.total ?? 0);
    setThisMonthBookings(data.thisMonth ?? 0);
    setThisWeekBookings(data.thisWeek ?? 0);
  }
})
.catch(() => {});
  }, []);

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Add this function after getInitials function (around line 145-150)
const getCardTypeColor = (cardType) => {
  const colors = {
    'Visa': '#1a56db',
    'MasterCard': '#dc2626',
    'American Express': '#059669',
    'Discover': '#ea580c',
    'Maestro': '#7c3aed',
    'Rupay': '#2563eb'
  };
  return colors[cardType] || '#6b7280';
};

const getCardTypeTextColor = (cardType) => {
  return 'white'; // Always white text for better contrast
};

  // Function to get account type badge style
  const getAccountTypeStyle = (type) => {
    const isHost = type === 'host' || type === 'Host';
    return {
      backgroundColor: isHost ? '#e6f7ed' : '#ebf5ff',
      color: isHost ? '#0a7b3e' : '#0066cc',
      borderColor: isHost ? '#0a7b3e' : '#0066cc',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-block',
      marginTop: '4px'
    };
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };
  const filteredBookings = bookings.filter(b =>
    (b.userName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b._id ?? '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.bookingId ?? '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard-page">
      {/* navbar full width */}
      <div className="admin-dashboard-fullwidth">
        <AdminNavbar />
        <button
            onClick={handleLogout}
            style={{
              marginLeft: 'auto',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
      </div>

      {/* top title / accent */}
      <div className="admin-dashboard-fullwidth">
        <div className="admin-dashboard-title-row">
          <h2 className="admin-dashboard-title">Dashboard Overview</h2>
          <span className="admin-dashboard-title-accent" />
        </div>
        {/* Overview cards */}
        <div className="admin-dashboard-overview-row">
          {/* Bookings card */}
          <div className="admin-dashboard-overview-card">
            <div className="admin-dashboard-accent-stripe" />
            <div className="admin-dashboard-number-shadow" />

            <div className="admin-dashboard-card-label">Total Booking</div>
            <div className="admin-dashboard-main-number">{totalBookings ?? 0}</div>
            <div className="admin-dashboard-meta-line">
              This Month: {thisMonthBookings ?? 0}
            </div>
            <div className="admin-dashboard-meta-line">
              This Week: {thisWeekBookings ?? 0}
            </div>
          </div>

          {/* Rooms card with Shared / Full */}
          <div className="admin-dashboard-overview-card">
            <div className="admin-dashboard-accent-stripe" />
            <div className="admin-dashboard-number-shadow" />

            <div className="admin-dashboard-card-label">Rooms Overview</div>
            {loadingRooms ? (
              <>
                <div className="admin-dashboard-main-number">...</div>
                <div className="admin-dashboard-meta-line">Loading...</div>
                <div className="admin-dashboard-meta-line">Please wait</div>
              </>
            ) : (
              <>
                <div className="admin-dashboard-main-number">
                  {roomCounts.available}
                </div>
                <div className="admin-dashboard-meta-line">
                  Total: {roomCounts.total} | Booked: {roomCounts.booked}
                </div>
                <div className="admin-dashboard-meta-line">
                  Shared Rooms: {roomTypeCounts.shared}
                </div>
                <div className="admin-dashboard-meta-line">
                  Full Rooms: {roomTypeCounts.full}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* content below overview */}
      <div className="admin-dashboard-below">
        {/* Customers & Activities */}
        <div className="admin-dashboard-two-col">
          <div className="admin-dashboard-side-card">
            <div className="admin-dashboard-side-header">
              <h3 className="admin-dashboard-side-title">New Customers</h3>
              <div className="admin-dashboard-small-bar" />
            </div>

            <ul className="admin-dashboard-list">
              {newCustomers.length > 0 ? (
                newCustomers.map((customer, i) => {
                  const isHost = customer.accountType === 'host' || customer.accountType === 'Host';
                  const initials = getInitials(customer.name);
                  
                  return (
                    <li key={customer.id || i} className="admin-dashboard-list-row">
                      <div 
                        className="admin-dashboard-avatar"
                        style={{
                          backgroundColor: isHost ? '#1cc88a' : '#4e73df',
                          color: 'white',
                          fontWeight: '600'
                        }}
                      >
                        {initials}
                      </div>
                      <div className="admin-dashboard-customer-details">
                        <div className="admin-dashboard-item-name">
                          {customer.name || 'Unknown User'}
                        </div>
                        <div className="admin-dashboard-item-email">
                          {customer.email || '—'}
                        </div>
                        <div 
                          style={getAccountTypeStyle(customer.accountType)}
                          className="admin-dashboard-account-type-badge"
                        >
                          {isHost ? '🏠 Host' : '✈️ Traveler'}
                        </div>
                        {customer.joinedDate && (
                          <div className="admin-dashboard-joined-date">
                            Joined: {customer.joinedDate}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })
              ) : (
                <div className="admin-dashboard-empty">
                  No new customers
                </div>
              )}
            </ul>
            
            {/* Summary info if available */}
            {/* {newCustomers.length > 0 && (
              <div className="admin-dashboard-customers-summary">
                <div className="admin-dashboard-summary-item">
                  <span className="admin-dashboard-summary-label">Total:</span>
                  <span className="admin-dashboard-summary-value">{newCustomers.length}</span>
                </div>
                <div className="admin-dashboard-summary-item">
                  <span className="admin-dashboard-summary-label">Travelers:</span>
                  <span className="admin-dashboard-summary-value">
                    {newCustomers.filter(c => c.accountType === 'Traveler' || c.accountType === 'traveller').length}
                  </span>
                </div>
                <div className="admin-dashboard-summary-item">
                  <span className="admin-dashboard-summary-label">Hosts:</span>
                  <span className="admin-dashboard-summary-value">
                    {newCustomers.filter(c => c.accountType === 'Host' || c.accountType === 'host').length}
                  </span>
                </div>
              </div>
            )} */}
          </div>

          <div className="admin-dashboard-side-card">
            <div className="admin-dashboard-side-header">
              <h3 className="admin-dashboard-side-title">Recent Activities</h3>
              <div className="admin-dashboard-small-bar" />
            </div>

<ul className="admin-dashboard-list">
  {recentActivities.length > 0 ? (
    recentActivities.map((act, i) => {
      const initials = getInitials(act.name);
      
      return (
        <li key={i} className="admin-dashboard-list-row">
          <div 
            className="admin-dashboard-avatar"
            style={{
              backgroundColor: '#f6c23e',
              color: 'white',
              fontWeight: '600'
            }}
          >
            {initials}
          </div>
          <div>
            <div className="admin-dashboard-activity-text">
              <strong>{act.name}</strong> {act.action}
            </div>
            <div className="admin-dashboard-activity-meta">
              <span className="admin-dashboard-activity-time">
                {act.dateFormatted} at {act.timeFormatted}
              </span>
              {act.email && (
                <span className="admin-dashboard-activity-email">
                  • {act.email}
                </span>
              )}
            </div>
            {act.amount > 0 && (
              <div className="admin-dashboard-activity-amount">
                Amount: ₹{act.amount.toLocaleString()}
              </div>
            )}
          </div>
        </li>
      );
    })
  ) : (
    <div className="admin-dashboard-empty">
      No recent activities
    </div>
  )}
</ul>
          </div>
        </div>

        {/* Revenue */}
        <div className="admin-dashboard-revenue-block">
          <div className="admin-dashboard-revenue-header">
            <h3 className="admin-dashboard-revenue-title">Revenue Overview</h3>
          </div>

          <div className="admin-dashboard-revenue-row">
            <div className="admin-dashboard-revenue-card">
              <p className="admin-dashboard-revenue-label">Total Revenue</p>
              <p className="admin-dashboard-revenue-value">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="admin-dashboard-revenue-card">
              <p className="admin-dashboard-revenue-label">This Month</p>
              <p className="admin-dashboard-revenue-value">
                ₹{thisMonthRevenue.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="admin-dashboard-revenue-card">
              <p className="admin-dashboard-revenue-label">This Week</p>
              <p className="admin-dashboard-revenue-value">
                ₹{thisWeekRevenue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Management */}
        {/* Booking Management */}
<section className="admin-dashboard-booking-section">
  <h3 className="admin-dashboard-booking-title">Booking Management</h3>

  <div>
    <input
      type="text"
      placeholder="Search by guest name, booking ID, or email"
      onChange={e => setSearchTerm(e.target.value)}
      className="admin-dashboard-search"
      value={searchTerm}
    />
  </div>

  <div className="admin-dashboard-table-wrap">
    {filteredBookings.length > 0 ? (
      <table className="admin-dashboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Transaction ID</th>
            <th>Guest Name</th>
            <th>Guest Email</th>
            <th>Room</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Total Cost</th>
            <th>Payment Card Type</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map((booking, i) => (
            <tr key={booking._id || i}>
              <td>{i + 1}</td>
              <td>
                {booking.transactionId ||
                  booking._id?.toString().substring(0, 8)}
              </td>
              <td>
                <div className="admin-dashboard-guest-name">
                  {booking.userName}
                </div>
              </td>
              <td>{booking.userEmail || 'N/A'}</td>
              <td>
                {booking.roomTitle ? (
                  <div>
                    <div className="admin-dashboard-room-title">
                      {booking.roomTitle}
                    </div>
                    {booking.roomId && (
                      <div className="admin-dashboard-room-id">
                        ID: {booking.roomId.toString().substring(0, 8)}...
                      </div>
                    )}
                  </div>
                ) : (
                  'N/A'
                )}
              </td>
              <td>
                {booking.checkIn ? (
                  <div>
                    {new Date(booking.checkIn).toLocaleDateString()}
                    <div className="admin-dashboard-date-time">
                      {new Date(booking.checkIn).toLocaleTimeString(
                        [],
                        { hour: '2-digit', minute: '2-digit' }
                      )}
                    </div>
                  </div>
                ) : (
                  '-'
                )}
              </td>
              <td>
                {booking.checkOut ? (
                  <div>
                    {new Date(booking.checkOut).toLocaleDateString()}
                    <div className="admin-dashboard-date-time">
                      {new Date(booking.checkOut).toLocaleTimeString(
                        [],
                        { hour: '2-digit', minute: '2-digit' }
                      )}
                    </div>
                  </div>
                ) : (
                  '-'
                )}
              </td>
              <td>
                <div className="admin-dashboard-cost">
                  ₹
                  {booking.totalCost?.toLocaleString('en-IN') ||
                    booking.amount?.toLocaleString('en-IN') ||
                    '0'}
                </div>
              </td>
              <td>
                {booking.cardType ? (
                  <span className="admin-dashboard-card-type" style={{
                    backgroundColor: getCardTypeColor(booking.cardType),
                    color: getCardTypeTextColor(booking.cardType),
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'inline-block'
                  }}>
                    {booking.cardType}
                  </span>
                ) : (
                  <span style={{
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'inline-block'
                  }}>
                    Not specified
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="admin-dashboard-no-data">
        {searchTerm
          ? 'No bookings matching your search.'
          : 'Loading bookings...'}
      </div>
    )}
  </div>
</section>
      </div>
    </div>
  );
}

export default AdminDashboard;