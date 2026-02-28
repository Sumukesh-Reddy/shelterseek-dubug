import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";

const AdminTrends = () => {
  const [trendData, setTrendData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("bar");
  const [chartType, setChartType] = useState("views");
  const navigate = useNavigate();

  const COLORS = [
    "#4e73df",
    "#1cc88a",
    "#36b9cc",
    "#f6c23e",
    "#e74a3b",
    "#6f42c1",
    "#20c9a6",
    "#fd7e14",
    "#20c997",
  ];

  // ---------- FETCH DATA ----------
// In AdminTrends.jsx, update the fetch URL
const fetchTrendsData = useCallback(async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token'); // Get token from localStorage
    
    const res = await fetch("http://localhost:3001/api/admin/trends", {
      headers: {
        'Authorization': `Bearer ${token}` // Add auth token
      }
    });
    
    const data = await res.json();

    if (!data.success) throw new Error("API failed");

    const processed = data.trends.map((r, idx) => ({
      id: r.roomId || idx,
      name: r.roomName || r.title || `Room ${idx + 1}`,
      views: r.totalViews || 0,
      likes: r.totalLikes || 0,
      engagement:
        r.totalViews > 0
          ? Math.round((r.totalLikes / r.totalViews) * 100)
          : 0,
      price: r.price || 0,
      host: r.host || "Unknown",
      location: r.location || "",
      rank: idx + 1,
    }));

    setTrendData(processed);
    setSummary(data.summary);
    setError(null);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchTrendsData();
  }, [fetchTrendsData]);

  const chartData = trendData.slice(0, 10).map(room => ({
    name: room.name.slice(0, 16),
    value:
      chartType === "views"
        ? room.views
        : chartType === "likes"
        ? room.likes
        : room.engagement
  }));

  // ---------- INLINE STYLES ----------
  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg,#fff5fb,#faf7ff,#fdfcff)",
      padding: 20,
      fontFamily: "Inter, Poppins, sans-serif",
    },
  
    container: {
      maxWidth: 1300,
      margin: "0 auto",
    },
  
    title: {
      fontSize: 30,
      fontWeight: 800,
      marginBottom: 6,
      background: "linear-gradient(90deg,#d72d6e,#7c3aed)",
      WebkitBackgroundClip: "text",
      color: "transparent",
    },
  
    subtitle: {
      color: "#7b7b7b",
      marginBottom: 20,
      fontSize: 14,
    },
  
    /* SUMMARY CARDS */
    grid4: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
      gap: 18,
      marginBottom: 26,
    },
  
    card: {
      background: "rgba(255,255,255,0.85)",
      borderRadius: 16,
      padding: 20,
      border: "1px solid rgba(0,0,0,0.05)",
      backdropFilter: "blur(6px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      transition: "0.2s",
    },
  
    cardTitle: {
      fontSize: 13,
      fontWeight: 600,
      color: "#666",
      marginBottom: 4,
    },
  
    cardValue: {
      fontSize: 28,
      fontWeight: 800,
      background: "linear-gradient(90deg,#d72d6e,#7c3aed)",
      WebkitBackgroundClip: "text",
      color: "transparent",
    },
  
    /* SECTION BOX */
    section: {
      background: "rgba(255,255,255,0.9)",
      borderRadius: 16,
      padding: 22,
      marginBottom: 26,
      backdropFilter: "blur(8px)",
      boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
      border: "1px solid rgba(0,0,0,0.05)",
    },
  
    /* BUTTON GROUP */
    btnGroup: {
      display: "flex",
      gap: 10,
      marginBottom: 14,
      flexWrap: "wrap",
    },
  
    btn: (active) => ({
      padding: "8px 14px",
      borderRadius: 12,
      border: "none",
      background: active
        ? "linear-gradient(90deg,#d72d6e,#a12672)"
        : "#f3f1f4",
      color: active ? "white" : "#333",
      cursor: "pointer",
      fontWeight: 600,
      boxShadow: active ? "0 4px 10px rgba(215,45,110,0.25)" : "none",
      transition: "0.2s",
    }),
  
    /* TABLE */
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: 10,
    },
  
    th: {
      textAlign: "left",
      padding: 10,
      background: "linear-gradient(90deg,#d72d6e,#7c3aed)",
      color: "white",
      fontSize: 12,
      fontWeight: 600,
    },
  
    td: {
      padding: 10,
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      fontSize: 14,
    },
  
    /* Hover Row */
    trHover: {
      background: "#ffe7f1",
    },
  
    /* Chart Shadow Box */
    chartBox: {
      borderRadius: 14,
      padding: 10,
      background: "rgba(255,255,255,0.55)",
      backdropFilter: "blur(5px)",
    },
  };
  
  if (loading)
    return (
      <div style={styles.page}>
        <div style={styles.container}>Loading Trends...</div>
      </div>
    );

  if (error)
    return (
      <div style={styles.page}>
        <div style={styles.container}>Error: {error}</div>
      </div>
    );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Room Trends Dashboard</h1>
        <p style={styles.subtitle}>
          Monitor views, likes and engagement of all rooms
        </p>

        {/* SUMMARY CARDS */}
        <div style={styles.grid4}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Total Views</div>
            <div style={styles.cardValue}>
              {summary.totalViews || 0}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Total Likes</div>
            <div style={styles.cardValue}>
              {summary.totalLikes || 0}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Avg Engagement</div>
            <div style={styles.cardValue}>
              {summary.avgEngagementRate || 0}%
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Active Rooms</div>
            <div style={styles.cardValue}>
              {summary.totalRooms || 0}
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={styles.section}>
          <div style={styles.btnGroup}>
            {["views", "likes", "engagement"].map((t) => (
              <button
                key={t}
                style={styles.btn(chartType === t)}
                onClick={() => setChartType(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={styles.btnGroup}>
            {["bar", "line", "pie", "radar"].map((t) => (
              <button
                key={t}
                style={styles.btn(viewMode === t)}
                onClick={() => setViewMode(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* CHART */}
          <ResponsiveContainer width="100%" height={400}>
            {viewMode === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  fill={
                    chartType === "views"
                      ? "#4e73df"
                      : chartType === "likes"
                      ? "#1cc88a"
                      : "#f6c23e"
                  }
                />
              </BarChart>
            ) : viewMode === "line" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  dataKey="value"
                  stroke="#4e73df"
                  strokeWidth={3}
                />
              </LineChart>
            ) : viewMode === "pie" ? (
              <PieChart>
                <Pie data={chartData} dataKey="value" outerRadius={140}>
                  {chartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : (
              <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar
                  dataKey="value"
                  stroke="#4e73df"
                  fill="#4e73df"
                  fillOpacity={0.6}
                />
                <Legend />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* TABLE */}
        <div style={styles.section}>
          <h2 style={{ marginBottom: 10 }}>Detailed Room Stats</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Views</th>
                <th style={styles.th}>Likes</th>
                <th style={styles.th}>Engagement</th>
                <th style={styles.th}>Price</th>
                {/* <th style={styles.th}>Action</th> */}
              </tr>
            </thead>
            <tbody>
              {trendData.map((r) => (
                <tr key={r.id}>
                  <td style={styles.td}>{r.rank}</td>
                  <td style={styles.td}>{r.name}</td>
                  <td style={styles.td}>{r.views}</td>
                  <td style={styles.td}>{r.likes}</td>
                  <td style={styles.td}>{r.engagement}%</td>
                  <td style={styles.td}>₹{r.price}</td>
                  <td style={styles.td}>
                    {/* <button
                      style={styles.btn(true)}
                      onClick={() =>
                        navigate(`/admin/rooms/${r.id}`)
                      }
                    >
                      View
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTrends;
