import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./FinanceDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const FinanceDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/finance/dashboard`);
    const result = await res.json();
    setData(result);
  };

  if (!data) return <h2>Loading...</h2>;

  /* ===== Chart Data ===== */

  const chartData = {
    labels: data.monthlyRevenue.map(
      (item) => `Month ${item._id}`
    ),
    datasets: [
      {
        label: "Monthly Revenue",
        data: data.monthlyRevenue.map((item) => item.revenue),
        backgroundColor: "#2563eb"
      }
    ]
  };

  return (
    <div className="dashboard-container">
      <h2>Finance Dashboard</h2>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card revenue">
          <h4>Total Revenue</h4>
          <p>₹ {data.totalRevenue}</p>
        </div>

        <div className="kpi-card refund">
          <h4>Total Refunds</h4>
          <p>₹ {data.totalRefunds}</p>
        </div>

        <div className="kpi-card net">
          <h4>Net Profit</h4>
          <p>₹ {data.netProfit}</p>
        </div>

        <div className="kpi-card booking">
          <h4>Total Bookings</h4>
          <p>{data.totalBookings}</p>
        </div>

        <div className="kpi-card commission">
          <h4>Commission Earned</h4>
          <p>₹ {data.platformCommission}</p>
        </div>

        <div className="kpi-card rate">
          <h4>Refund Rate</h4>
          <p>{data.refundRate}%</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="chart-section">
        <h3>Monthly Revenue</h3>
        <Bar data={chartData} />
      </div>

      {/* Recent Bookings */}
      <div className="recent-bookings">
        <h3>Recent Bookings</h3>
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>User</th>
              <th>Room</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.recentBookings.map((b) => (
              <tr key={b._id}>
                <td>{b.bookingId}</td>
                <td>{b.travelerName}</td>
                <td>{b.roomTitle}</td>
                <td>₹ {b.totalCost}</td>
                <td>{b.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceDashboard;