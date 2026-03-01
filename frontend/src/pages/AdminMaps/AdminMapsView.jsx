import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useParams } from "react-router-dom";

// Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// ✅ Auto-zoom map to all markers or to searched markers
const FitBounds = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (!markers || markers.length === 0) return;

    const bounds = L.featureGroup(
      markers.map(m => L.marker([m.coordinates.lat, m.coordinates.lng]))
    );

    map.fitBounds(bounds.getBounds().pad(0.2));
  }, [markers, map]);

  return null;
};

// ✅ Custom icons for verified and not verified rooms based on status field
const createCustomIcon = (status) => {
  const isVerified = status === "verified";
  const iconColor = isVerified ? "#10b981" : "#ef4444"; // Green for verified, red for not verified
  const borderColor = isVerified ? "#059669" : "#dc2626";
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${iconColor};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid ${borderColor};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          color: white;
          font-size: 16px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${isVerified ? '✓' : '!'}
        </div>
        <div style="
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          background: ${borderColor};
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
        ">
          ${isVerified ? 'Verified' : status || 'Pending'}
        </div>
      </div>
    `,
    iconSize: [40, 60],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
    className: "custom-marker"
  });
};

// ✅ Improved Section component with better styling
const Section = ({ label, value, highlight = false }) => (
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "8px 0",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "14px",
    lineHeight: "1.4"
  }}>
    <strong style={{
      color: "#4b5563",
      fontWeight: 600,
      minWidth: "120px",
      flexShrink: 0
    }}>{label}:</strong>
    <span style={{
      color: highlight ? (label === "Status" ? "#ffffff" : "#1f2937") : "#374151",
      fontWeight: highlight ? 600 : 400,
      textAlign: "right",
      flex: 1,
      marginLeft: "10px",
      padding: highlight ? "4px 8px" : "0",
      borderRadius: highlight ? "4px" : "0",
      backgroundColor: highlight ? (value === "Verified" ? "#10b981" : "#ef4444") : "transparent"
    }}>{value ?? "N/A"}</span>
  </div>
);

// ✅ Improved Verification badge component
const VerificationBadge = ({ status }) => {
  const isVerified = status === "verified";
  const statusText = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";
  const statusColor = isVerified ? "#065f46" : "#991b1b";
  const bgColor = isVerified ? "#d1fae5" : "#fee2e2";
  const borderColor = isVerified ? "#10b981" : "#ef4444";
  
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 12px",
      borderRadius: "20px",
      backgroundColor: bgColor,
      color: statusColor,
      fontSize: "12px",
      fontWeight: "bold",
      border: `2px solid ${borderColor}`,
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      {isVerified ? "✓ Verified" : `✗ ${statusText}`}
    </div>
  );
};

// ✅ Popup Header Component
const PopupHeader = ({ title, status }) => (
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
    marginBottom: "12px",
    borderBottom: "2px solid #e5e7eb",
    position: "sticky",
    top: 0,
    background: "#ffffff",
    zIndex: 100
  }}>
    <h3 style={{
      margin: 0,
      fontSize: "18px",
      fontWeight: 700,
      color: "#1f2937",
      lineHeight: "1.3",
      maxWidth: "70%"
    }}>
      {title || "Untitled Room"}
    </h3>
    <VerificationBadge status={status} />
  </div>
);

// ✅ Info Grid Component
const InfoGrid = ({ children }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "4px",
    marginBottom: "12px"
  }}>
    {children}
  </div>
);

// ✅ Image Gallery Component
const ImageGallery = ({ images }) => {
  if (!images?.length) {
    console.log('No images to display:', images);
    return null;
  }
  
  // Process image URLs like in RoomLayout
  const processImageUrl = (img) => {
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `http://localhost:3001${img}`;
    if (/^[0-9a-fA-F]{24}$/.test(img)) return `http://localhost:3001/api/images/${img}`;
    return '/images/logo.png';
  };
  
  console.log('ImageGallery received images:', images);
  
  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{ 
        fontWeight: 600, 
        color: "#4b5563", 
        marginBottom: "8px",
        fontSize: "14px"
      }}>
        Room Images ({images.length}):
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
        gap: "8px",
        maxHeight: "120px",
        overflowY: "auto"
      }}>
        {images.map((img, index) => {
          const imageUrl = processImageUrl(img);
          console.log(`Image ${index}: ${img} -> ${imageUrl}`);
          
          return (
            <img
              key={index}
              src={imageUrl}
              alt="Room"
              style={{
                width: "100%",
                height: "80px",
                borderRadius: "8px",
                border: "2px solid #e5e7eb",
                objectFit: "cover",
                cursor: "pointer",
                transition: "transform 0.2s"
              }}
              onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.target.style.transform = "scale(1)"}
              onError={(e) => {
                console.error(`Failed to load image: ${imageUrl}`);
                e.target.onerror = null;
                e.target.src = '/images/logo.png';
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const AdminMapsView = () => {
  const { hostEmail } = useParams();

  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [verificationFilter, setVerificationFilter] = useState("all");

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 820 : false
  );

  const mapRef = useRef(null);

  // ---------- Handle screen resize ----------
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 820);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---------- Fetch host rooms ----------
  useEffect(() => {
    if (!hostEmail) return;

    fetch(`http://localhost:3001/api/rooms/host/${hostEmail}`)
      .then(res => res.json())
      .then(data => {
        const dataRooms =
          Array.isArray(data) ? data : Array.isArray(data.rooms) ? data.rooms : [];

        console.log("Fetched rooms with status:", dataRooms.map(r => ({ 
          title: r.title, 
          status: r.status,
          verified: r.verified
        })));
        setRooms(dataRooms);
        setFilteredRooms(dataRooms);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed fetching rooms:", err);
        setLoading(false);
      });
  }, [hostEmail]);

  // ---------- Apply search and filter ----------
  useEffect(() => {
    let result = rooms;

    // Apply verification filter based on status field
    if (verificationFilter === "verified") {
      result = result.filter(room => room.status === "verified");
    } else if (verificationFilter === "not-verified") {
      result = result.filter(room => room.status !== "verified");
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(room =>
        room.title?.toLowerCase().includes(lower) ||
        room.location?.toLowerCase().includes(lower) ||
        room.propertyType?.toLowerCase().includes(lower) ||
        room.status?.toLowerCase().includes(lower)
      );
    }

    setFilteredRooms(result);
  }, [rooms, searchQuery, verificationFilter]);

  // ---------- Valid coordinates ----------
  const validMarkers = filteredRooms.filter(
    r => r.coordinates?.lat && r.coordinates?.lng
  );

  // ---------- Stats ----------
  const verifiedCount = rooms.filter(r => r.status === "verified").length;
  const notVerifiedCount = rooms.filter(r => r.status !== "verified").length;
  const withCoordinatesCount = rooms.filter(r => r.coordinates?.lat && r.coordinates?.lng).length;
  
  // Get all unique statuses for filter buttons
  const statusTypes = [...new Set(rooms.map(r => r.status).filter(Boolean))];

  // ---------- Loading ----------
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "20px"
      }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "5px solid #e5e7eb",
          borderTopColor: "#4f46e5",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ fontSize: "18px", color: "#374151" }}>Loading rooms...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!rooms.length) {
    return (
      <div style={{
        textAlign: "center",
        padding: "40px",
        background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        minHeight: "100vh"
      }}>
        <h2 style={{ color: "#374151", marginBottom: "20px" }}>No rooms found for this host.</h2>
        <p style={{ color: "#6b7280" }}>Host email: {hostEmail}</p>
      </div>
    );
  }

  // ---------- Inline Styles ----------
  const styles = {
    pageTitle: {
      textAlign: "center",
      background: "linear-gradient(90deg, #4e73df, #6f8afe)",
      color: "#fff",
      padding: "18px",
      fontFamily: "Inter, Poppins",
      fontWeight: 700,
      fontSize: "22px",
      position: "relative"
    },
    statsContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "15px",
      margin: "15px auto",
      flexWrap: "wrap",
      maxWidth: "1200px"
    },
    statCard: {
      background: "white",
      padding: "12px 20px",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minWidth: "120px"
    },
    statValue: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "4px"
    },
    statLabel: {
      fontSize: "12px",
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    filtersContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "15px",
      margin: "15px auto",
      flexWrap: "wrap",
      maxWidth: "800px"
    },
    filterButton: (active) => ({
      padding: "10px 20px",
      borderRadius: "25px",
      border: "none",
      cursor: "pointer",
      background: active ? "#4f46e5" : "#e5e7eb",
      color: active ? "white" : "#374151",
      fontWeight: "700",
      fontSize: "14px",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }),
    searchWrap: {
      margin: "18px auto",
      width: "90%",
      maxWidth: "600px",
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      flexDirection: isMobile ? "column" : "row"
    },
    searchInput: {
      flex: 1,
      padding: "14px 20px",
      borderRadius: "25px",
      border: "2px solid #e5e7eb",
      fontSize: "15px",
      transition: "all 0.3s ease"
    },
    searchBtn: {
      padding: "14px 30px",
      borderRadius: "25px",
      border: "none",
      cursor: "pointer",
      background: "linear-gradient(90deg, #10b981, #06b6d4)",
      color: "#fff",
      fontWeight: "700",
      fontSize: "15px",
      transition: "all 0.3s ease"
    },
    legendContainer: {
      position: "absolute",
      bottom: "20px",
      left: "20px",
      background: "white",
      padding: "15px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: 1000,
      maxWidth: "200px"
    },
    legendTitle: {
      margin: "0 0 10px 0",
      fontSize: "14px",
      fontWeight: "bold",
      color: "#374151"
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      marginBottom: "8px",
      fontSize: "12px"
    },
    legendColor: (color) => ({
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      marginRight: "10px",
      backgroundColor: color
    })
  };

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <div style={styles.pageTitle}>
        Host Rooms Map - {hostEmail}
        <div style={{ fontSize: "14px", fontWeight: "normal", marginTop: "5px", opacity: 0.9 }}>
          {rooms.length} total rooms • {verifiedCount} verified • {notVerifiedCount} not verified
        </div>
      </div>

      {/* ✅ Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: "#4f46e5" }}>{rooms.length}</div>
          <div style={styles.statLabel}>Total Rooms</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: "#10b981" }}>{verifiedCount}</div>
          <div style={styles.statLabel}>Verified</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: "#ef4444" }}>{notVerifiedCount}</div>
          <div style={styles.statLabel}>Not Verified</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: "#8b5cf6" }}>{withCoordinatesCount}</div>
          <div style={styles.statLabel}>On Map</div>
        </div>
      </div>

      {/* ✅ Filters */}
      <div style={styles.filtersContainer}>
        <button
          style={styles.filterButton(verificationFilter === "all")}
          onClick={() => setVerificationFilter("all")}
          onMouseEnter={e => verificationFilter !== "all" && (e.target.style.background = "#d1d5db")}
          onMouseLeave={e => verificationFilter !== "all" && (e.target.style.background = "#e5e7eb")}
        >
          <span>📍</span> All Rooms ({rooms.length})
        </button>
        <button
          style={styles.filterButton(verificationFilter === "verified")}
          onClick={() => setVerificationFilter("verified")}
          onMouseEnter={e => verificationFilter !== "verified" && (e.target.style.background = "#d1d5db")}
          onMouseLeave={e => verificationFilter !== "verified" && (e.target.style.background = "#e5e7eb")}
        >
          <span>✓</span> Verified ({verifiedCount})
        </button>
        <button
          style={styles.filterButton(verificationFilter === "not-verified")}
          onClick={() => setVerificationFilter("not-verified")}
          onMouseEnter={e => verificationFilter !== "not-verified" && (e.target.style.background = "#d1d5db")}
          onMouseLeave={e => verificationFilter !== "not-verified" && (e.target.style.background = "#e5e7eb")}
        >
          <span>!</span> Not Verified ({notVerifiedCount})
        </button>
      </div>

      {/* ✅ Search UI */}
      <div style={styles.searchWrap}>
        <input
          type="text"
          placeholder="Search room by name, location, property type, or status..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && setSearchQuery(e.target.value)}
          onFocus={e => e.target.style.borderColor = "#4f46e5"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          style={styles.searchInput}
        />

        <button 
          style={styles.searchBtn}
          onClick={() => setSearchQuery(searchQuery)}
          onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.target.style.transform = "translateY(0)"}
        >
          Search
        </button>
      </div>

      {/* ✅ Map Container */}
      <div style={{ position: "relative", margin: "20px auto", width: "95%", maxWidth: "1400px" }}>
        <MapContainer
          center={[20, 78]}
          zoom={5}
          whenCreated={map => (mapRef.current = map)}
          style={{
            height: "70vh",
            width: "100%",
            margin: "0 auto",
            borderRadius: "20px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            border: "2px solid #e5e7eb"
          }}
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {validMarkers.map(room => {
            const isVerified = room.status === "verified";
            
            return (
              <Marker
                key={room._id}
                position={[room.coordinates.lat, room.coordinates.lng]}
                icon={createCustomIcon(room.status)}
              >
                <Popup maxWidth={isMobile ? 300 : 400} minWidth={isMobile ? 250 : 350}>
                  <div style={{
                    maxHeight: "70vh",
                    overflowY: "auto",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "#ffffff",
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    width: "100%",
                    boxSizing: "border-box"
                  }}>
                    {/* Header */}
                    <PopupHeader title={room.title} status={room.status} />

                    {/* Info Grid */}
                    <InfoGrid>
                      <Section 
                        label="Status" 
                        value={room.status ? room.status.charAt(0).toUpperCase() + room.status.slice(1) : "Pending"} 
                        highlight={true}
                      />
                      <Section label="Host Name" value={room.name} />
                      <Section label="Email" value={room.email} />
                      <Section label="Price" value={`₹${room.price?.toLocaleString()}`} />
                      <Section label="Location" value={room.location} />
                      <Section 
                        label="Coordinates" 
                        value={`${room.coordinates.lat?.toFixed(4)}, ${room.coordinates.lng?.toFixed(4)}`} 
                      />
                      <Section 
                        label="Property Type" 
                        value={`${room.propertyType || 'N/A'} / ${room.roomType || 'N/A'}`} 
                      />
                      <Section label="Capacity" value={`${room.capacity} guests`} />
                      <Section label="Bedrooms" value={room.bedrooms} />
                      <Section label="Beds" value={room.beds} />
                      <Section label="Room Size" value={room.roomSize ? `${room.roomSize} sq ft` : 'N/A'} />
                      <Section label="Transport" value={room.transportDistance} />
                      <Section label="Host Gender" value={room.hostGender} />
                      <Section label="Food Facility" value={room.foodFacility} />
                      <Section 
                        label="Amenities" 
                        value={
                          room.amenities?.length
                            ? room.amenities.slice(0, 3).join(", ") + (room.amenities.length > 3 ? ` +${room.amenities.length - 3} more` : "")
                            : "None"
                        } 
                      />
                      <Section label="Discount" value={`${room.discount || 0}%`} />
                      <Section label="Likes" value={room.likes || 0} />
                      <Section label="Booking" value={room.booking ? "Enabled" : "Disabled"} />
                      <Section 
                        label="Created" 
                        value={room.createdAt ? new Date(room.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'} 
                      />
                    </InfoGrid>

                    {/* Reviews Section */}
                    {room.reviews?.length > 0 && (
                      <div style={{ 
                        marginTop: "12px", 
                        padding: "12px",
                        background: "#f9fafb",
                        borderRadius: "8px"
                      }}>
                        <div style={{ 
                          fontWeight: 600, 
                          color: "#4b5563", 
                          marginBottom: "8px",
                          fontSize: "14px"
                        }}>
                          Reviews ({room.reviews.length}):
                        </div>
                        <div style={{ 
                          maxHeight: "100px",
                          overflowY: "auto",
                          paddingRight: "8px"
                        }}>
                          {room.reviews.slice(0, 3).map((review, index) => (
                            <div key={index} style={{
                              padding: "6px 8px",
                              background: "white",
                              borderRadius: "6px",
                              marginBottom: "4px",
                              fontSize: "12px",
                              borderLeft: "3px solid #4f46e5"
                            }}>
                              {review}
                            </div>
                          ))}
                          {room.reviews.length > 3 && (
                            <div style={{
                              fontSize: "11px",
                              color: "#6b7280",
                              textAlign: "center",
                              padding: "4px",
                              fontStyle: "italic"
                            }}>
                              +{room.reviews.length - 3} more reviews
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Images */}
                    <ImageGallery images={room.images} />
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* ✅ Auto-fit map */}
          <FitBounds markers={validMarkers} />
        </MapContainer>

        {/* ✅ Legend */}
        <div style={styles.legendContainer}>
          <div style={styles.legendTitle}>Map Legend</div>
          <div style={styles.legendItem}>
            <div style={styles.legendColor("#10b981")}></div>
            <span>Verified</span>
          </div>
          <div style={styles.legendItem}>
            <div style={styles.legendColor("#ef4444")}></div>
            <span>Not Verified</span>
          </div>
          <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "10px", fontStyle: "italic" }}>
            {validMarkers.length} rooms displayed
          </div>
        </div>
      </div>

      {/* ✅ Results Summary */}
      <div style={{
        textAlign: "center",
        margin: "20px auto",
        padding: "15px",
        background: "white",
        borderRadius: "15px",
        maxWidth: "800px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
      }}>
        <div style={{ fontSize: "14px", color: "#6b7280" }}>
          Showing <strong style={{ color: "#4f46e5" }}>{filteredRooms.length}</strong> of <strong>{rooms.length}</strong> rooms • 
          <span style={{ color: "#10b981", marginLeft: "10px" }}>{verifiedCount} verified</span> • 
          <span style={{ color: "#ef4444", marginLeft: "10px" }}>{notVerifiedCount} not verified</span>
        </div>
        
        {validMarkers.length < filteredRooms.length && (
          <div style={{ fontSize: "12px", color: "#f59e0b", marginTop: "10px" }}>
            ⚠️ {filteredRooms.length - validMarkers.length} rooms missing coordinates
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMapsView;