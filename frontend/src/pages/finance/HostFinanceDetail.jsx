import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Download, 
  TrendingUp, 
  DollarSign,
  Home,
  Users,
  CreditCard,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import "./HostFinanceDetail.css";

const HostFinanceDetail = () => {
  const { email } = useParams();
  const [data, setData] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [timeRange, setTimeRange] = useState("month");
  const [showCharts, setShowCharts] = useState(true);
  const [expandedStats, setExpandedStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [dateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        timeRange,
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      }).toString();
      
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/finance/host/${email}?${queryParams}`
      );
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [email, timeRange, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportData = () => {
    // Prepare data for export
    const exportData = {
      hostSummary: {
        totalRevenue: data.totalRevenue,
        totalBookings: data.totalBookings,
        avgRevenue: data.avgRevenue,
        rooms: data.rooms.length
      },
      rooms: data.rooms.map(room => ({
        roomTitle: room.roomTitle,
        totalRevenue: room.totalRevenue,
        totalBookings: room.totalBookings,
        createdAt: room.createdAt,
        bookings: room.bookings
      }))
    };

    // Convert to JSON and download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `host-finance-${email}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    // Export bookings as CSV
    let csvContent = "Room,Booking ID,User,Email,Amount,Refund,Status,Method,Date\n";
    
    data.rooms.forEach(room => {
      room.bookings.forEach(booking => {
        csvContent += `"${room.roomTitle}","${booking.bookingId}","${booking.travelerName}","${booking.travelerEmail}",${booking.totalCost},${booking.refundAmount},"${booking.paymentStatus}","${booking.paymentMethod}","${new Date(booking.paymentDate).toLocaleDateString()}"\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `host-bookings-${email}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const toggleStats = (roomId) => {
    setExpandedStats(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  // Prepare chart data
  const getRevenueChartData = () => {
    if (!data) return [];
    
    const revenueByDate = {};
    data.rooms.forEach(room => {
      room.bookings.forEach(booking => {
        const date = new Date(booking.paymentDate).toLocaleDateString();
        revenueByDate[date] = (revenueByDate[date] || 0) + booking.totalCost;
      });
    });

    return Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getRoomRevenueData = () => {
    if (!data) return [];
    return data.rooms.map(room => ({
      name: room.roomTitle.length > 20 ? room.roomTitle.substring(0, 20) + '...' : room.roomTitle,
      revenue: room.totalRevenue,
      bookings: room.totalBookings
    }));
  };

  const getPaymentMethodData = () => {
    if (!data) return [];
    
    const methodCount = {};
    data.rooms.forEach(room => {
      room.bookings.forEach(booking => {
        methodCount[booking.paymentMethod] = (methodCount[booking.paymentMethod] || 0) + 1;
      });
    });

    return Object.entries(methodCount).map(([name, value]) => ({ name, value }));
  };

  const revenueChartData = getRevenueChartData();
  const roomRevenueData = getRoomRevenueData();
  const paymentMethodData = getPaymentMethodData();

  if (loading) {
    return (
      <div className="loading-container">
        <RefreshCw className="spinner" size={40} />
        <h2>Loading host financial data...</h2>
      </div>
    );
  }

  if (!data) return <h2>No data found</h2>;

  return (
    <div className="host-detail-container">
      {/* ===== HEADER WITH CONTROLS ===== */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Host Financial Dashboard</h1>
          <p className="host-email">{email}</p>
        </div>
        
        <div className="header-controls">
          <div className="time-range-selector">
            <button 
              className={timeRange === 'week' ? 'active' : ''} 
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button 
              className={timeRange === 'month' ? 'active' : ''} 
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
            <button 
              className={timeRange === 'quarter' ? 'active' : ''} 
              onClick={() => setTimeRange('quarter')}
            >
              Quarter
            </button>
            <button 
              className={timeRange === 'year' ? 'active' : ''} 
              onClick={() => setTimeRange('year')}
            >
              Year
            </button>
          </div>

          <div className="action-buttons">
            <button className="export-btn" onClick={handleExportData} title="Export JSON">
              <Download size={18} />
              <span>JSON</span>
            </button>
            <button className="export-btn" onClick={handleExportCSV} title="Export CSV">
              <Download size={18} />
              <span>CSV</span>
            </button>
            <button 
              className="toggle-charts-btn"
              onClick={() => setShowCharts(!showCharts)}
              title={showCharts ? "Hide Charts" : "Show Charts"}
            >
              {showCharts ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ===== ENHANCED SUMMARY CARDS ===== */}
      <div className="summary-cards">
        <div className="summary-card primary">
          <div className="card-icon">
            <DollarSign size={24} />
          </div>
          <div className="card-content">
            <h4>Total Revenue</h4>
            <p className="amount">₹ {data.totalRevenue.toLocaleString()}</p>
            <span className="trend positive">
              <TrendingUp size={14} /> +12.5% vs last period
            </span>
          </div>
        </div>

        <div className="summary-card success">
          <div className="card-icon">
            <Home size={24} />
          </div>
          <div className="card-content">
            <h4>Total Bookings</h4>
            <p className="amount">{data.totalBookings}</p>
            <span className="trend positive">
              <TrendingUp size={14} /> +8.3% vs last period
            </span>
          </div>
        </div>

        <div className="summary-card info">
          <div className="card-icon">
            <Users size={24} />
          </div>
          <div className="card-content">
            <h4>Average Revenue</h4>
            <p className="amount">₹ {Math.round(data.avgRevenue).toLocaleString()}</p>
            <span className="trend neutral">Per booking</span>
          </div>
        </div>

        <div className="summary-card warning">
          <div className="card-icon">
            <CreditCard size={24} />
          </div>
          <div className="card-content">
            <h4>Active Rooms</h4>
            <p className="amount">{data.rooms.length}</p>
            <span className="trend">Total properties</span>
          </div>
        </div>
      </div>

      {/* ===== CHARTS SECTION ===== */}
      {showCharts && (
        <div className="charts-section">
          <div className="chart-container">
            <h3>Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹ ${value}`, 'Revenue']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="charts-grid">
            <div className="chart-container">
              <h3>Room Revenue Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={roomRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹ ${value}`} />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Payment Methods</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ===== ROOMS TABLE WITH ENHANCED FEATURES ===== */}
      <div className="rooms-section">
        <div className="section-header">
          <h3>Room Performance</h3>
          <div className="table-controls">
            <button className="filter-btn">
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <input 
              type="text" 
              placeholder="Search rooms..." 
              className="search-input"
            />
          </div>
        </div>

        <table className="rooms-table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Total Revenue</th>
              <th>Total Bookings</th>
              <th>Avg. Booking Value</th>
              <th>Created At</th>
              <th>Performance</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.rooms.map((room) => (
              <React.Fragment key={room._id}>
                <tr className={selectedRoom === room._id ? 'active-row' : ''}>
                  <td className="room-title-cell">
                    <strong>{room.roomTitle}</strong>
                  </td>
                  <td className="amount-cell">₹ {room.totalRevenue.toLocaleString()}</td>
                  <td>{room.totalBookings}</td>
                  <td className="amount-cell">
                    ₹ {room.totalBookings > 0 
                      ? Math.round(room.totalRevenue / room.totalBookings).toLocaleString() 
                      : 0}
                  </td>
                  <td>{new Date(room.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="performance-indicator">
                      <div 
                        className="progress-bar"
                        style={{
                          width: `${(room.totalRevenue / Math.max(...data.rooms.map(r => r.totalRevenue))) * 100}%`
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons-cell">
                      <button
                        className="view-btn"
                        onClick={() => setSelectedRoom(selectedRoom === room._id ? null : room._id)}
                      >
                        {selectedRoom === room._id ? 'Hide' : 'View Details'}
                      </button>
                      <button 
                        className="stats-toggle"
                        onClick={() => toggleStats(room._id)}
                      >
                        {expandedStats[room._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* ===== ENHANCED BOOKINGS DETAILS ===== */}
                {selectedRoom === room._id && (
                  <tr className="details-row">
                    <td colSpan="7">
                      <div className="booking-details">
                        <div className="booking-stats">
                          <div className="mini-stat">
                            <span>Total Bookings</span>
                            <strong>{room.bookings.length}</strong>
                          </div>
                          <div className="mini-stat">
                            <span>Total Revenue</span>
                            <strong>₹ {room.totalRevenue.toLocaleString()}</strong>
                          </div>
                          <div className="mini-stat">
                            <span>Success Rate</span>
                            <strong>
                              {((room.bookings.filter(b => b.paymentStatus === 'completed').length / 
                                room.bookings.length) * 100).toFixed(1)}%
                            </strong>
                          </div>
                        </div>

                        <table className="bookings-table">
                          <thead>
                            <tr>
                              <th>Booking ID</th>
                              <th>User</th>
                              <th>Email</th>
                              <th>Amount</th>
                              <th>Refund</th>
                              <th>Status</th>
                              <th>Method</th>
                              <th>Date</th>
                            </tr>
                          </thead>

                          <tbody>
                            {room.bookings.map((b, i) => (
                              <tr key={i} className={
                                b.paymentStatus === 'failed' ? 'failed-row' :
                                b.paymentStatus === 'refunded' ? 'refunded-row' : ''
                              }>
                                <td>
                                  <span className="booking-id">{b.bookingId}</span>
                                </td>
                                <td>{b.travelerName}</td>
                                <td>{b.travelerEmail}</td>
                                <td className="amount-cell">₹ {b.totalCost.toLocaleString()}</td>
                                <td className="amount-cell">₹ {b.refundAmount?.toLocaleString() || 0}</td>
                                <td>
                                  <span className={`status-badge ${b.paymentStatus}`}>
                                    {b.paymentStatus}
                                  </span>
                                </td>
                                <td>{b.paymentMethod}</td>
                                <td>
                                  {new Date(b.paymentDate).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== ADDITIONAL INSIGHTS ===== */}
      <div className="insights-section">
        <div className="insight-card">
          <h4>Top Performing Room</h4>
          {data.rooms.length > 0 && (
            <>
              <p className="insight-value">
                {data.rooms.reduce((max, room) => 
                  room.totalRevenue > max.totalRevenue ? room : max
                ).roomTitle}
              </p>
              <span className="insight-label">
                Revenue: ₹ {Math.max(...data.rooms.map(r => r.totalRevenue)).toLocaleString()}
              </span>
            </>
          )}
        </div>

        <div className="insight-card">
          <h4>Booking Success Rate</h4>
          <p className="insight-value">
            {((data.rooms.reduce((acc, room) => 
              acc + room.bookings.filter(b => b.paymentStatus === 'completed').length, 0
            ) / data.totalBookings) * 100).toFixed(1)}%
          </p>
          <span className="insight-label">Completed payments</span>
        </div>

        <div className="insight-card">
          <h4>Average Booking Value</h4>
          <p className="insight-value">
            ₹ {Math.round(data.avgRevenue).toLocaleString()}
          </p>
          <span className="insight-label">Per transaction</span>
        </div>

        <div className="insight-card">
          <h4>Refund Rate</h4>
          <p className="insight-value">
            {((data.rooms.reduce((acc, room) => 
              acc + room.bookings.reduce((sum, b) => sum + (b.refundAmount || 0), 0), 0
            ) / data.totalRevenue) * 100).toFixed(1)}%
          </p>
          <span className="insight-label">Of total revenue</span>
        </div>
      </div>
    </div>
  );
};

export default HostFinanceDetail;