import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserRevenue.css";

const UserRevenue = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/finance/users`);
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users revenue:", error);
      setLoading(false);
    }
  };

  /* ===== Stats Calculation ===== */

  const totalRevenue = users.reduce((acc, u) => acc + u.totalRevenue, 0);
  const totalRefunded = users.reduce((acc, u) => acc + u.totalRefunded, 0);
  const totalBookings = users.reduce((acc, u) => acc + u.totalBookings, 0);

  /* ===== Search Filter ===== */

  const filteredUsers = users.filter((user) =>
    user.travelerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.travelerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <h2>Loading...</h2>;

  return (
    <div className="finance-container">
      <h2 className="finance-title">User Revenue Overview</h2>

      {/* ===== Stats Cards ===== */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value">₹ {totalRevenue}</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Refunds</div>
          <div className="stat-value">₹ {totalRefunded}</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Bookings</div>
          <div className="stat-value">{totalBookings}</div>
        </div>
      </div>

      {/* ===== Search Bar ===== */}
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* ===== Users Table ===== */}
      <div className="table-container">
        <table className="finance-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Total Bookings</th>
              <th>Total Revenue</th>
              <th>Total Refunded</th>
              <th>Net Revenue</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.travelerId}>
                  <td>{user.travelerName}</td>
                  <td>{user.travelerEmail}</td>
                  <td>{user.totalBookings}</td>
                  <td>₹ {user.totalRevenue}</td>
                  <td>₹ {user.totalRefunded}</td>
                  <td
                    className={
                      user.netRevenue >= 0
                        ? "net-positive"
                        : "net-negative"
                    }
                  >
                    ₹ {user.netRevenue}
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() =>
                        navigate(`/finance/user/${user.travelerId}`)
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRevenue;