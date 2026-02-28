import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminNotifications() {
  const [activeTab, setActiveTab] = useState('host'); // 'host' or 'traveller'
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 820 : false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 820);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token'); // Get token from storage
    
    fetch(`http://localhost:3001/api/users?accountType=${activeTab}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Users data:', data); // For debugging
        
        // Handle different response formats
        if (data.success && data.data) {
          if (activeTab === 'host' && data.data.hosts) {
            setUsers(data.data.hosts);
          } else if (activeTab === 'traveller' && data.data.travelers) {
            setUsers(data.data.travelers);
          } else if (Array.isArray(data.data)) {
            setUsers(data.data);
          } else {
            setUsers([]);
          }
        } else if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
          setError('Unexpected response from server');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch users');
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();

      if (data.success) {
        fetchUsers();
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete user. Please try again.');
    }
  };

  const filteredUsers = users.filter((user) =>
    (user.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ---------- Professional Inline Styles ----------
  const colors = {
    primary: {
      dark: '#0f172a',
      main: '#1e293b',
      light: '#334155'
    },
    secondary: {
      dark: '#0369a1',
      main: '#0ea5e9',
      light: '#7dd3fc'
    },
    accent: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#8b5cf6'
    },
    neutral: {
      white: '#ffffff',
      light: '#f8fafc',
      gray: '#64748b',
      darkGray: '#475569'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      secondary: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)',
      success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      danger: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      card: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
    }
  };

  const styles = {
    container: {
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      padding: isMobile ? '20px 16px' : '32px 24px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: colors.primary.dark
    },

    contentWrapper: {
      maxWidth: 1200,
      margin: '0 auto',
      background: colors.neutral.white,
      borderRadius: '16px',
      boxShadow: '0 8px 40px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06)',
      border: `1px solid ${colors.neutral.light}`,
      overflow: 'hidden'
    },

    headerSection: {
      background: colors.gradients.primary,
      padding: isMobile ? '24px 20px' : '32px 28px',
      color: colors.neutral.white,
      position: 'relative'
    },

    backBtn: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '10px 16px',
      borderRadius: '10px',
      cursor: 'pointer',
      color: colors.neutral.white,
      fontWeight: '600',
      fontSize: '14px',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: 'fit-content',
      marginBottom: '16px'
    },

    backBtnHover: {
      background: 'rgba(255, 255, 255, 0.25)',
      transform: 'translateY(-1px)'
    },

    title: {
      fontSize: isMobile ? '24px' : '32px',
      fontWeight: '700',
      margin: '0 0 8px 0',
      background: 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },

    subtitle: {
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.8)',
      margin: '0',
      fontWeight: '500'
    },

    mainContent: {
      padding: isMobile ? '24px 20px' : '32px 28px'
    },

    // Tabs Section
    tabsSection: {
      marginBottom: '28px'
    },

    tabButtons: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },

    tabBtn: (active) => ({
      padding: '14px 24px',
      borderRadius: '12px',
      border: active ? 'none' : `1px solid ${colors.neutral.light}`,
      background: active ? colors.gradients.secondary : colors.neutral.white,
      color: active ? colors.neutral.white : colors.primary.main,
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      boxShadow: active ? '0 8px 24px rgba(14, 165, 233, 0.25)' : '0 2px 8px rgba(15, 23, 42, 0.06)',
      transition: 'all 0.3s ease',
      flex: isMobile ? '1 1 calc(50% - 6px)' : 'none',
      minWidth: '120px',
      position: 'relative',
      overflow: 'hidden'
    }),

    tabBtnHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 32px rgba(14, 165, 233, 0.35)'
    },

    // Search Section
    searchSection: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      marginBottom: '28px',
      flexDirection: isMobile ? 'column' : 'row'
    },

    searchContainer: {
      position: 'relative',
      flex: '1',
      maxWidth: '500px',
      width: '100%'
    },

    searchInput: {
      width: '100%',
      padding: '16px 20px 16px 48px',
      borderRadius: '12px',
      border: `1px solid ${colors.neutral.light}`,
      fontSize: '15px',
      outline: 'none',
      background: colors.neutral.white,
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
      transition: 'all 0.3s ease'
    },

    searchInputFocus: {
      borderColor: colors.secondary.main,
      boxShadow: `0 4px 16px rgba(14, 165, 233, 0.15), 0 0 0 3px rgba(14, 165, 233, 0.1)`
    },

    searchIcon: {
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: colors.neutral.gray,
      fontSize: '18px'
    },

    resultsCount: {
      fontSize: '14px',
      color: colors.neutral.gray,
      fontWeight: '500',
      background: colors.neutral.light,
      padding: '8px 16px',
      borderRadius: '8px',
      minWidth: 'fit-content'
    },

    // Table Section
    tableSection: {
      background: colors.neutral.white,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
      border: `1px solid ${colors.neutral.light}`
    },

    tableContainer: {
      overflowX: 'auto'
    },

    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '800px'
    },

    tableHeader: {
      background: colors.gradients.primary
    },

    tableHeaderCell: {
      padding: isMobile ? '16px 12px' : '20px 16px',
      textAlign: 'left',
      fontSize: '13px',
      fontWeight: '600',
      color: colors.neutral.white,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: `1px solid ${colors.primary.light}`
    },

    tableRow: {
      transition: 'background-color 0.2s ease',
      borderBottom: `1px solid ${colors.neutral.light}`
    },

    tableRowHover: {
      backgroundColor: colors.neutral.light
    },

    tableCell: {
      padding: isMobile ? '16px 12px' : '20px 16px',
      fontSize: '14px',
      color: colors.primary.main,
      fontWeight: '500'
    },

    // Action Buttons
    actionsCell: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },

    btnView: {
      background: colors.gradients.success,
      color: colors.neutral.white,
      border: 'none',
      padding: '10px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '13px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
    },

    btnViewHover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
    },

    btnDelete: {
      background: colors.gradients.danger,
      color: colors.neutral.white,
      border: 'none',
      padding: '10px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '13px',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)'
    },

    btnDeleteHover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 16px rgba(239, 68, 68, 0.35)'
    },

    // Loading and Empty States
    loadingState: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px 20px',
      flexDirection: 'column',
      gap: '16px'
    },

    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: `3px solid ${colors.neutral.light}`,
      borderTop: `3px solid ${colors.secondary.main}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },

    noData: {
      textAlign: 'center',
      padding: '60px 20px',
      color: colors.neutral.gray
    },

    noDataTitle: {
      fontSize: '18px',
      fontWeight: '600',
      margin: '0 0 8px 0',
      color: colors.primary.main
    },

    noDataText: {
      fontSize: '14px',
      margin: '0 0 16px 0',
      color: colors.neutral.gray
    },

    errorState: {
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      border: `1px solid ${colors.accent.error}`,
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      margin: '20px 0'
    },

    errorText: {
      color: colors.accent.error,
      fontWeight: '600',
      margin: '0'
    },

    // User Status Badge
    statusBadge: (accountType) => ({
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
      background: accountType === 'host' 
        ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
        : 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      color: colors.neutral.white,
      display: 'inline-block'
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        {/* Header Section */}
        <div style={styles.headerSection}>
          <button 
            style={styles.backBtn}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.backBtnHover);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.target.style, styles.backBtn);
            }}
            onClick={() => window.history.back()}
          >
            ← Back to Dashboard
          </button>
          
          <h1 style={styles.title}>User Management</h1>
          <p style={styles.subtitle}>
            Manage and monitor {activeTab === 'host' ? 'property hosts' : 'travellers'} across the platform
          </p>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Tabs Section */}
          <div style={styles.tabsSection}>
            <div style={styles.tabButtons}>
              <button
                style={styles.tabBtn(activeTab === 'host')}
                onMouseEnter={(e) => {
                  if (activeTab === 'host') {
                    Object.assign(e.target.style, styles.tabBtnHover);
                  }
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.target.style, styles.tabBtn(activeTab === 'host'));
                }}
                onClick={() => setActiveTab('host')}
              >
                🏠 Property Hosts
              </button>

              <button
                style={styles.tabBtn(activeTab === 'traveller')}
                onMouseEnter={(e) => {
                  if (activeTab === 'traveller') {
                    Object.assign(e.target.style, styles.tabBtnHover);
                  }
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.target.style, styles.tabBtn(activeTab === 'traveller'));
                }}
                onClick={() => setActiveTab('traveller')}
              >
                ✈️ Travellers
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div style={styles.searchSection}>
            <div style={styles.searchContainer}>
              <div style={styles.searchIcon}>🔍</div>
              <input
                type="text"
                placeholder={`Search ${activeTab === 'host' ? 'hosts' : 'travellers'} by name or email...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                onFocus={(e) => {
                  Object.assign(e.target.style, styles.searchInputFocus);
                }}
                onBlur={(e) => {
                  Object.assign(e.target.style, styles.searchInput);
                }}
              />
            </div>
            
            
          </div>
          <div style={styles.resultsCount}>
              {filteredUsers.length} {activeTab === 'host' ? 'hosts' : 'travellers'} found
            </div>
          {/* Error State */}
          {error && (
            <div style={styles.errorState}>
              <p style={styles.errorText}>⚠️ {error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div style={styles.loadingState}>
              <div style={styles.loadingSpinner}></div>
              <p style={styles.noDataText}>Loading users...</p>
            </div>
          ) : (
            /* Users Table */
            filteredUsers.length > 0 ? (
              <div style={styles.tableSection}>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr>
                        <th style={styles.tableHeaderCell}>Name</th>
                        <th style={styles.tableHeaderCell}>Email</th>
                        <th style={styles.tableHeaderCell}>Account Type</th>
                        <th style={styles.tableHeaderCell}>Joined Date</th>
                        <th style={styles.tableHeaderCell}>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr 
                          key={user._id}
                          style={styles.tableRow}
                          onMouseEnter={(e) => {
                            Object.assign(e.target.style, styles.tableRowHover);
                          }}
                          onMouseLeave={(e) => {
                            Object.assign(e.target.style, styles.tableRow);
                          }}
                        >
                          <td style={styles.tableCell}>
                            <strong>{user.name || 'N/A'}</strong>
                          </td>
                          <td style={styles.tableCell}>{user.email}</td>
                          <td style={styles.tableCell}>
                            <span style={styles.statusBadge(user.accountType)}>
                              {user.accountType}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : '-'}
                          </td>
                          <td style={{ ...styles.tableCell, ...styles.actionsCell }}>
                            <button
                              style={styles.btnView}
                              onMouseEnter={(e) => {
                                Object.assign(e.target.style, styles.btnViewHover);
                              }}
                              onMouseLeave={(e) => {
                                Object.assign(e.target.style, styles.btnView);
                              }}
                              onClick={() => {
                                if (activeTab === 'host') {
                                  navigate(`/host/${encodeURIComponent(user.email)}`);
                                } else {
                                  navigate(`/traveler/${encodeURIComponent(user.email)}/bookings`);
                                }
                              }}
                            >
                              👁️ View
                            </button>

                            <button 
                              style={styles.btnDelete}
                              onMouseEnter={(e) => {
                                Object.assign(e.target.style, styles.btnDeleteHover);
                              }}
                              onMouseLeave={(e) => {
                                Object.assign(e.target.style, styles.btnDelete);
                              }}
                              onClick={() => handleDelete(user._id)}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div style={styles.noData}>
                <h3 style={styles.noDataTitle}>
                  No {activeTab === 'host' ? 'hosts' : 'travellers'} found
                </h3>
                <p style={styles.noDataText}>
                  {searchTerm 
                    ? `No users match your search for "${searchTerm}"`
                    : `There are no ${activeTab === 'host' ? 'hosts' : 'travellers'} in the system yet.`
                  }
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default AdminNotifications;