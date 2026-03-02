import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./FinanceLayout.css";

const FinanceLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", path: "/finance/dashboard" },
    { name: "User Revenue", path: "/finance/users" },
    { name: "Transactions", path: "/finance/hosts" },
    // { name: "Refunds", path: "/finance/refunds" },
    // { name: "Reports", path: "/finance/reports" },
    { name: "Profile", path: "/finance/profile" }
  ];

  const isActivePath = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="finance-wrapper">
      <div className="finance-sidebar">
        <h2 className="logo">Finance</h2>

        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`sidebar-item ${isActivePath(item.path) ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            {item.name}
          </div>
        ))}
      </div>

      <div className="finance-main">
        <div className="finance-topbar">
          <div className="topbar-title">Finance Manager Panel</div>
          <div className="topbar-actions">
            <button
              type="button"
              className="topbar-profile"
              onClick={() => navigate("/finance/profile")}
            >
              {user?.name || "Manager"}
            </button>
            <button
              type="button"
              className="topbar-logout"
              onClick={() => {
                logout();
                navigate("/manager-login");
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="finance-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FinanceLayout;
