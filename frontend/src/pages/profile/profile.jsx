import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch user from Redux
  const currentUser = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // On mount, if Redux is empty → fallback to sessionStorage
  useEffect(() => {
    if (!currentUser || !currentUser.email) {
      const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (!sessionUser) {
        navigate("/loginweb");
      }
    }

    setLoading(false);
  }, [currentUser, navigate]);

  // Alert helper
  const showAlert = (msg, type = "success") => {
    setAlert({ show: true, type, message: msg });
    setTimeout(() => setAlert({ show: false }), 2500);
  };

  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword) {
      showAlert("Passwords do not match", "error");
      return;
    }

    if (newPassword.length < 8) {
      showAlert("Password must be at least 8 characters", "error");
      return;
    }

    try {
      showAlert("Updating password...", "info");

      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          currentPassword,
          newPassword,
          accountType: currentUser.accountType,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        showAlert("Password updated!", "success");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        showAlert(data.message || "Error updating password", "error");
      }
    } catch (err) {
      showAlert("Server error", "error");
    }
  };

  // Logout
  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    dispatch(clearUser());
    navigate("/");
  };

  // Loading UI
  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading...</p>
      </div>
    );
  }

  // Not logged in
  if (!currentUser || !currentUser.email) {
    return (
      <div className="profile-page">
        <h2>Please Login</h2>
        <button className="btn btn-primary" onClick={() => navigate("/loginweb")}>
          Go to Login
        </button>
      </div>
    );
  }

  // MAIN UI
  return (
    <div className="profile-page">

      {/* Alert */}
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}

      <div className="header-bg" />

      <div className="profile-container">

        <div className="details-box">

          <div className="section">
            <h3>Account Information</h3>

            <div className="info-grid">

                            

              <div className="info-item">
                <span className="info-label">Full Name:</span>
                <span className="info-value">
                  {/* Check for both lowercase and camelCase variations */}
                  {(currentUser.firstname || currentUser.firstName) && (currentUser.lastname || currentUser.lastName)
                    ? `${currentUser.firstname || currentUser.firstName} ${currentUser.lastname || currentUser.lastName}`
                    : currentUser.name || "User"} 
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{currentUser.email}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Account Type:</span>
                <span className="info-value capitalize">
                  {currentUser.accountType}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Member ID:</span>
                <span className="info-value">
                  {/* Check for _id AND id */}
                  {(currentUser._id || currentUser.id)?.substring(0, 8) || "N/A"}...
                </span>
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="section">
            <h3>Change Password</h3>

            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Update Password
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="section">
            <h3>Account Actions</h3>

            <div className="action-buttons">

              {currentUser.accountType === "traveller" && (
                <button
                  onClick={() => navigate("/wishlist")}
                  className="btn btn-secondary"
                >
                  My Wishlist
                </button>
              )}

              <button
                onClick={() => navigate("/messages")}
                className="btn btn-secondary"
              >
                Messages
              </button>

              {currentUser.accountType === "traveller" && (
              <button
                onClick={() => navigate("/BookedHistory")}
                className="btn btn-secondary"
              >
                Booked History
              </button>
              )}
              <button onClick={logout} className="btn btn-danger">
                Logout
              </button>
            

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
