import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./UserFinanceDetail.css";

const UserFinanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserFinance();
  }, []);

  const fetchUserFinance = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/finance/user/${id}`
      );
      const result = await res.json();
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setLoading(false);
    }
  };

  if (loading) return <h2>Loading...</h2>;

  if (!data) return <h2>No data found</h2>;

  return (
    <div className="finance-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2>User Finance Details</h2>

      {/* ===== Summary Cards ===== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Bookings</div>
          <div className="stat-value">{data.totalBookings}</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value">₹ {data.totalRevenue}</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Refunded</div>
          <div className="stat-value">₹ {data.totalRefunded}</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Net Revenue</div>
          <div className="stat-value">
            ₹ {data.netRevenue}
          </div>
        </div>
      </div>

      {/* ===== Booking Table ===== */}
      <div className="table-container">
        <table className="finance-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Room</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Cost</th>
              <th>Refund</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {data.bookings.map((booking) => (
              <tr key={booking._id}>
                <td>{booking.bookingId}</td>
                <td>{booking.roomTitle}</td>
                <td>
                  {new Date(booking.checkIn).toLocaleDateString()}
                </td>
                <td>
                  {new Date(booking.checkOut).toLocaleDateString()}
                </td>
                <td>₹ {booking.totalCost}</td>
                <td>₹ {booking.refundAmount}</td>
                <td>{booking.bookingStatus}</td>
                <td>{booking.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserFinanceDetail;