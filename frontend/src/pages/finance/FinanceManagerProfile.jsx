import React, { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../contexts/AuthContext";
import "./FinanceManagerProfile.css";

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

const maskAadhaar = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length !== 12) {
    return "N/A";
  }

  return `XXXX XXXX ${digits.slice(-4)}`;
};

const maskPan = (value) => {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized.length !== 10) {
    return "N/A";
  }

  return `${normalized.slice(0, 5)}****${normalized.slice(-1)}`;
};

const FinanceManagerProfile = () => {
  const { user, token } = useAuth();
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const authToken = token || localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchManagerProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(API_ENDPOINTS.MANAGERS.PROFILE, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Failed to load manager profile");
        }

        setManager(data.manager || null);
      } catch (fetchError) {
        console.error("Failed to load finance manager profile:", fetchError);
        setError(fetchError.message || "Failed to load manager profile");
      } finally {
        setLoading(false);
      }
    };

    fetchManagerProfile();
  }, [authToken]);

  const profile = useMemo(() => manager || user || {}, [manager, user]);

  const profileGroups = useMemo(
    () => [
      {
        title: "Personal Information",
        items: [
          { label: "Full Name", value: profile.name || "N/A" },
          { label: "Email Address", value: profile.email || "N/A" },
          { label: "Phone Number", value: profile.phone || "N/A" },
          { label: "Date of Birth", value: formatDate(profile.dob) },
          { label: "Gender", value: profile.gender || "N/A" }
        ]
      },
      {
        title: "Role & Department",
        items: [
          { label: "Role", value: profile.role || "Manager" },
          { label: "Department", value: profile.department || "N/A" },
          { label: "Username", value: profile.username || "N/A" },
          { label: "Joining Date", value: formatDate(profile.joiningDate) },
          { label: "Account Created", value: formatDate(profile.createdAt) }
        ]
      },
      {
        title: "Identity Verification",
        items: [
          { label: "Aadhaar Card Number", value: maskAadhaar(profile.aadhaar) },
          { label: "PAN Card Number", value: maskPan(profile.pan) }
        ]
      }
    ],
    [profile]
  );

  const handlePasswordFieldChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError("Fill in all password fields");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(API_ENDPOINTS.MANAGERS.CHANGE_PASSWORD, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(passwordForm)
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to change password");
      }

      setSuccessMessage(data?.message || "Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (changeError) {
      console.error("Failed to change finance manager password:", changeError);
      setError(changeError.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="finance-manager-profile">
      <header className="finance-manager-profile-hero">
        <div>
          <p className="finance-manager-profile-kicker">Finance Profile</p>
          <h1>Manager Profile & Security</h1>
          <p>
            Review account details, identity records, and update your manager password from the finance workspace.
          </p>
        </div>
        <div className="finance-manager-profile-badge">
          <span>Department</span>
          <strong>{profile.department || "Finance"}</strong>
        </div>
      </header>

      {(error || successMessage) && (
        <div className={`finance-manager-profile-banner ${error ? "error" : "success"}`}>
          {error || successMessage}
        </div>
      )}

      {loading ? (
        <div className="finance-manager-profile-loading">Loading manager profile...</div>
      ) : (
        <div className="finance-manager-profile-grid">
          <section className="finance-manager-profile-main">
            {profileGroups.map((group) => (
              <article key={group.title} className="finance-manager-profile-card">
                <div className="finance-manager-profile-card-header">
                  <h2>{group.title}</h2>
                </div>
                <div className="finance-manager-profile-facts-grid">
                  {group.items.map((item) => (
                    <div key={item.label} className="finance-manager-profile-fact">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <aside className="finance-manager-profile-side">
            <section className="finance-manager-profile-card">
              <div className="finance-manager-profile-card-header">
                <h2>Change Password</h2>
                <button
                  type="button"
                  className="finance-manager-password-toggle"
                  onClick={() => setShowPasswords((currentValue) => !currentValue)}
                >
                  {showPasswords ? "Hide" : "Show"}
                </button>
              </div>

              <form className="finance-manager-password-form" onSubmit={handlePasswordChange}>
                <label>
                  <span>Current Password</span>
                  <input
                    type={showPasswords ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordFieldChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </label>

                <label>
                  <span>New Password</span>
                  <input
                    type={showPasswords ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFieldChange}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />
                </label>

                <label>
                  <span>Confirm New Password</span>
                  <input
                    type={showPasswords ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFieldChange}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </label>

                <button type="submit" className="finance-manager-password-submit" disabled={changingPassword}>
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
};

export default FinanceManagerProfile;
