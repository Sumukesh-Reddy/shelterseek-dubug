import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function HostDetails() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [hostRooms, setHostRooms] = useState([]);
  const [roomCount, setRoomCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 820 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 820);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchHostRooms = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:3001/api/rooms/host/${email}`);
        const data = await res.json();

        // Handle the API response format from roomController
        if (data && data.rooms) {
          setHostRooms(data.rooms);
          setRoomCount(data.roomCount ?? data.rooms.length ?? 0);
        } else if (data && data.data && Array.isArray(data.data)) {
          // If response has data property with array
          setHostRooms(data.data);
          setRoomCount(data.data.length);
        } else if (Array.isArray(data)) {
          setHostRooms(data);
          setRoomCount(data.length);
        } else {
          setHostRooms([]);
          setRoomCount(0);
          setError("Unexpected response from server");
        }
      } catch (err) {
        console.error("Error fetching host rooms:", err);
        setError("Failed to load host rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchHostRooms();
  }, [email]);

  // ---------- inline styles (scoped) ----------
  const styles = {
    page: {
      fontFamily: '"Inter","Poppins",sans-serif',
      maxWidth: 1200,
      margin: "26px auto",
      padding: isMobile ? 12 : 20,
      color: "#0f172a",
    },
    backBtn: {
      display: "inline-block",
      marginBottom: 14,
      padding: "8px 12px",
      borderRadius: 10,
      border: "1px solid rgba(15,23,42,0.08)",
      background: "white",
      cursor: "pointer",
      fontWeight: 700,
    },
    header: { marginTop: 0, marginBottom: 6 },
    subHeader: { marginTop: 4, marginBottom: 16, color: "#374151" },
    error: {
      color: "#b91c1c",
      background: "rgba(185,28,28,0.06)",
      padding: 12,
      borderRadius: 10,
      marginBottom: 12,
    },
    loading: { textAlign: "center", padding: 18, color: "#6b7280" },
    roomGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
      gap: 18,
    },
    roomCard: {
      background: "linear-gradient(180deg,#ffffff,#fbfdff)",
      borderRadius: 12,
      padding: 16,
      boxShadow: "0 10px 28px rgba(2,6,23,0.06)",
      border: "1px solid rgba(2,6,23,0.04)",
    },
    roomTitle: { margin: "0 0 8px 0", fontSize: 18, fontWeight: 700 },
    roomInfo: { fontSize: 14, color: "#111827", lineHeight: 1.45 },
    infoRow: { marginBottom: 8 },
    bold: { fontWeight: 700, marginRight: 6 },
    imageWrapper: { marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 },
    img: { width: "100%", height: 180, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(0,0,0,0.06)" },
    reviews: { marginTop: 10, fontSize: 14 },
    noData: { padding: 18, color: "#6b7280" },
  };

  if (loading) return <p style={styles.loading}>Loading host rooms...</p>;

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 style={styles.header}>Host Details</h1>
      <h2 style={styles.subHeader}>Email: {email}</h2>
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Total Rooms: {roomCount}</h3>

      {error && <div style={styles.error}>{error}</div>}

      {hostRooms && hostRooms.length > 0 ? (
        <div style={styles.roomGrid}>
          {hostRooms.map((room) => (
            <div key={room._id} style={styles.roomCard}>
              <h2 style={styles.roomTitle}>{room.title || "Untitled Room"}</h2>

              <div style={styles.roomInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.bold}>Host Name:</span> {room.name || "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Host Email:</span> {room.email || "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Description:</span> {room.description || "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Price:</span> ₹{room.price ?? "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Location:</span> {room.location ?? "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Coordinates:</span>{" "}
                  {room.coordinates ? `${room.coordinates.lat}, ${room.coordinates.lng}` : "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Max Days:</span> {room.maxdays ?? "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Property Type:</span> {room.propertyType ?? "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Room Type:</span> {room.roomType ?? "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Capacity:</span> {room.capacity ?? "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Bedrooms:</span> {room.bedrooms ?? 0} <span style={{ marginLeft: 10, fontWeight: 700 }}>Beds:</span> {room.beds ?? 0}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Room Size:</span> {room.roomSize ?? "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Room Location:</span> {room.roomLocation ?? "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Transport Distance:</span> {room.transportDistance ?? "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Host Gender:</span> {room.hostGender ?? "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Food Facility:</span> {room.foodFacility ?? "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Amenities:</span> {room.amenities?.length ? room.amenities.join(", ") : "None"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Discount:</span> {room.discount ?? 0}%
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Likes:</span> {room.likes ?? 0}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Status:</span> {room.status ?? "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Booking Enabled:</span> {room.booking ? "Yes" : "No"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Created At:</span>{" "}
                  {room.createdAt ? new Date(room.createdAt).toLocaleString() : "N/A"}
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.bold}>Updated At:</span>{" "}
                  {room.updatedAt ? new Date(room.updatedAt).toLocaleString() : "N/A"}
                </div>

                {room.reviews?.length > 0 && (
                  <div style={styles.reviews}>
                    <div style={{ fontWeight: 700 }}>Reviews:</div>
                    <ul style={{ marginTop: 6 }}>
                      {room.reviews.map((rev, idx) => (
                        <li key={idx} style={{ marginBottom: 6 }}>{rev}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {room.images && room.images.length > 0 && (
                  <div style={styles.imageWrapper}>
                    {room.images.map((imgId) => (
                      <img
                        key={imgId}
                        src={`http://localhost:3001/api/images/${imgId}`}
                        alt="Room"
                        style={styles.img}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={styles.noData}>No rooms found for this host.</p>
      )}
    </div>
  );
}

export default HostDetails;