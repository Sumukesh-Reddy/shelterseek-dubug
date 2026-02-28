import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faBed,
  faChartLine,
  faTachometerAlt,
  faUser,
  faUserCircle,
  faStickyNote,
  faSignOutAlt,
  faCaretDown,
  faFire
} from "@fortawesome/free-solid-svg-icons";

const AdminNavbar = () => {
  const [openProfile, setOpenProfile] = useState(false);

  // GLOBAL NAVBAR STYLE (BIGGER + CENTERED)
  const styles = {
    navbar: {
      width: "100%",
      padding: "18px 0",
      background: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      fontFamily: "Inter, Poppins, sans-serif"
    },

    navWrapper: {
      width: "90%",
      maxWidth: "1400px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },

    list: {
      display: "flex",
      alignItems: "center",
      gap: "45px", // even spacing for all
      listStyle: "none",
      margin: 0,
      padding: 0
    },

    link: {
      textDecoration: "none",
      fontSize: "17px", // bigger text
      fontWeight: 600,
      color: "#111",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 18px",
      borderRadius: "12px",
      transition: "0.2s"
    },

    linkHover: {
      background: "rgba(78,115,223,0.15)",
      color: "#4e73df",
      transform: "translateY(-2px)"
    },

    icon: {
      fontSize: "20px" // bigger icons
    },

    dropdown: {
      position: "relative"
    },

    dropdownMenu: {
      position: "absolute",
      top: "55px",
      left: 0,
      minWidth: "180px",
      background: "#fff",
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      borderRadius: "12px",
      padding: "10px",
      display: openProfile ? "block" : "none",
      zIndex: 2000
    },

    dropdownItem: {
      padding: "10px 14px",
      borderRadius: "10px",
      color: "#222",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      textDecoration: "none",
      fontSize: "15px",
      fontWeight: 500,
      transition: "0.2s"
    },

    dropdownItemHover: {
      background: "rgba(240,245,255,1)",
      color: "#4e73df"
    }
  };

  // Component for clickable nav items with hover style
  const NavItem = ({ to, icon, label }) => {
    const [hover, setHover] = useState(false);

    return (
      <li>
        <Link
          to={to}
          style={{ ...styles.link, ...(hover ? styles.linkHover : {}) }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <FontAwesomeIcon icon={icon} style={styles.icon} />
          {label}
        </Link>
      </li>
    );
  };

  // helper for dropdown item hover
  const DropdownItem = ({ to, icon, label }) => {
    const [hover, setHover] = useState(false);
    return (
      <Link
        to={to}
        style={{
          ...styles.dropdownItem,
          ...(hover ? styles.dropdownItemHover : {})
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <FontAwesomeIcon icon={icon} />
        {label}
      </Link>
    );
  };

  return (
    <header style={styles.navbar}>
      <nav style={styles.navWrapper}>
        <ul style={styles.list}>
          <NavItem to="/admindashboard" icon={faTachometerAlt} label="Dashboard" />
          <NavItem to="/admin/hostrequests" icon={faBed} label="Host" />
          <NavItem to="/admin_map" icon={faChartLine} label="Maps" />

        
          <NavItem to="/admin_trends" icon={faFire} label="Trends" />

          <NavItem to="/admin_notifications" icon={faBell} label="Users" />
          <NavItem to="/admin/managers/register" icon={faUser} label="Managers" />
         
        </ul>
      </nav>
    </header>
  );
};

export default AdminNavbar;
