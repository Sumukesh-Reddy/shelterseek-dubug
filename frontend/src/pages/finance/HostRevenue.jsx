import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  Award,
  Home,
  DollarSign,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Star,
  Crown,
  Medal,
  BarChart3,
  PieChart as PieChartIcon,
  Mail,
  ArrowUpDown
} from "lucide-react";
import "./HostRevenue.css";

const HostRevenue = () => {
  const [hosts, setHosts] = useState([]);
  const [filteredHosts, setFilteredHosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "totalRevenue", direction: "desc" });
  const [filterTier, setFilterTier] = useState("all");
  const [showStats, setShowStats] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [selectedHosts, setSelectedHosts] = useState([]);
  const [dateRange, setDateRange] = useState("month");
  const [expandedStats, setExpandedStats] = useState({});
  const navigate = useNavigate();

  const COLORS = {
    Platinum: '#8B5CF6',
    Gold: '#F59E0B',
    Silver: '#94A3B8',
    Bronze: '#B45309'
  };

  const fetchHosts = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/finance/hosts?range=${dateRange}`);
      const data = await res.json();
      setHosts(data);
    } catch (error) {
      console.error("Error fetching hosts:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const filterAndSortHosts = React.useCallback(() => {
    let filtered = [...hosts];

    // Apply search filter
    if (search) {
      filtered = filtered.filter((h) =>
        h.hostEmail.toLowerCase().includes(search.toLowerCase()) ||
        (h.hostName && h.hostName.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply tier filter
    if (filterTier !== "all") {
      filtered = filtered.filter(h => getBadge(h.totalRevenue) === filterTier);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'hostEmail') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredHosts(filtered);
  }, [hosts, search, filterTier, sortConfig]);

  useEffect(() => {
    fetchHosts();
  }, [fetchHosts]);

  useEffect(() => {
    filterAndSortHosts();
  }, [filterAndSortHosts]);

  const getBadge = (revenue) => {
    if (revenue > 500000) return "Platinum";
    if (revenue > 200000) return "Gold";
    if (revenue > 100000) return "Silver";
    return "Bronze";
  };

  const getBadgeIcon = (badge) => {
    switch(badge) {
      case "Platinum": return <Crown size={16} />;
      case "Gold": return <Star size={16} />;
      case "Silver": return <Medal size={16} />;
      default: return <Award size={16} />;
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSelectAll = () => {
    if (selectedHosts.length === filteredHosts.length) {
      setSelectedHosts([]);
    } else {
      setSelectedHosts(filteredHosts.map(h => h.hostId));
    }
  };

  const handleSelectHost = (hostId) => {
    setSelectedHosts(prev =>
      prev.includes(hostId)
        ? prev.filter(id => id !== hostId)
        : [...prev, hostId]
    );
  };

  const handleBulkExport = () => {
    const selectedData = hosts.filter(h => selectedHosts.includes(h.hostId));
    const csvContent = [
      ["Email", "Rooms", "Total Revenue", "Avg Revenue", "Badge"],
      ...selectedData.map(h => [
        h.hostEmail,
        h.totalRooms,
        h.totalRevenue,
        Math.round(h.avgRevenue),
        getBadge(h.totalRevenue)
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hosts-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleRefresh = () => {
    fetchHosts();
  };

  const toggleStats = (hostId) => {
    setExpandedStats(prev => ({
      ...prev,
      [hostId]: !prev[hostId]
    }));
  };

  // Calculate statistics
  const totalRevenue = filteredHosts.reduce((sum, h) => sum + h.totalRevenue, 0);
  const avgRevenuePerHost = filteredHosts.length > 0 
    ? totalRevenue / filteredHosts.length 
    : 0;
  const totalRooms = filteredHosts.reduce((sum, h) => sum + h.totalRooms, 0);
  
  const tierDistribution = {
    Platinum: filteredHosts.filter(h => getBadge(h.totalRevenue) === "Platinum").length,
    Gold: filteredHosts.filter(h => getBadge(h.totalRevenue) === "Gold").length,
    Silver: filteredHosts.filter(h => getBadge(h.totalRevenue) === "Silver").length,
    Bronze: filteredHosts.filter(h => getBadge(h.totalRevenue) === "Bronze").length
  };

  const chartData = Object.entries(tierDistribution).map(([name, value]) => ({
    name,
    value
  }));

  const revenueRangeData = [
    { range: "0-100k", count: filteredHosts.filter(h => h.totalRevenue <= 100000).length },
    { range: "100k-200k", count: filteredHosts.filter(h => h.totalRevenue > 100000 && h.totalRevenue <= 200000).length },
    { range: "200k-500k", count: filteredHosts.filter(h => h.totalRevenue > 200000 && h.totalRevenue <= 500000).length },
    { range: "500k+", count: filteredHosts.filter(h => h.totalRevenue > 500000).length }
  ];

  if (loading) {
    return (
      <div className="host-loading-container">
        <RefreshCw className="spinner" size={40} />
        <h2>Loading host data...</h2>
      </div>
    );
  }

  return (
    <div className="host-container">
      {/* ===== HEADER ===== */}
      <div className="host-header">
        <div className="header-left">
          <h1>Host Revenue Dashboard</h1>
          <p className="host-count">{filteredHosts.length} hosts found</p>
        </div>
        
        <div className="header-controls">
          <div className="date-range-selector">
            <button 
              className={dateRange === 'week' ? 'active' : ''} 
              onClick={() => setDateRange('week')}
            >
              Week
            </button>
            <button 
              className={dateRange === 'month' ? 'active' : ''} 
              onClick={() => setDateRange('month')}
            >
              Month
            </button>
            <button 
              className={dateRange === 'quarter' ? 'active' : ''} 
              onClick={() => setDateRange('quarter')}
            >
              Quarter
            </button>
            <button 
              className={dateRange === 'year' ? 'active' : ''} 
              onClick={() => setDateRange('year')}
            >
              Year
            </button>
          </div>

          <button className="refresh-btn" onClick={handleRefresh} title="Refresh">
            <RefreshCw size={18} />
          </button>

          <button 
            className="toggle-view-btn"
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
          >
            {viewMode === 'table' ? 'Grid View' : 'Table View'}
          </button>

          {selectedHosts.length > 0 && (
            <button className="export-selected-btn" onClick={handleBulkExport}>
              <Download size={18} />
              <span>Export Selected ({selectedHosts.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ===== SUMMARY STATS CARDS ===== */}
      {showStats && (
        <div className="host-stats-grid">
          <div className="stat-card">
            <div className="stat-icon total-revenue">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-value">₹ {totalRevenue.toLocaleString()}</p>
              <span className="stat-trend positive">
                <TrendingUp size={14} /> +15.3%
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon avg-revenue">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>Avg/Host Revenue</h3>
              <p className="stat-value">₹ {Math.round(avgRevenuePerHost).toLocaleString()}</p>
              <span className="stat-trend positive">Per host</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon total-rooms">
              <Home size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Rooms</h3>
              <p className="stat-value">{totalRooms}</p>
              <span className="stat-trend">Across all hosts</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon top-host">
              <Award size={24} />
            </div>
            <div className="stat-content">
              <h3>Top Host</h3>
              <p className="stat-value">
                {filteredHosts.length > 0 
                  ? filteredHosts.reduce((max, h) => h.totalRevenue > max.totalRevenue ? h : max).hostEmail.split('@')[0]
                  : 'N/A'}
              </p>
              <span className="stat-trend">
                ₹ {filteredHosts.length > 0 
                  ? Math.max(...filteredHosts.map(h => h.totalRevenue)).toLocaleString()
                  : 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== CHARTS SECTION ===== */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <BarChart3 size={18} />
              Revenue Distribution
            </h3>
            <button className="toggle-btn" onClick={() => setShowStats(!showStats)}>
              {showStats ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueRangeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <PieChartIcon size={18} />
              Host Tiers
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== FILTERS AND SEARCH ===== */}
      <div className="filters-section">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="host-search"
          />
        </div>

        <div className="filter-controls">
          <select 
            className="filter-select"
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
          >
            <option value="all">All Tiers</option>
            <option value="Platinum">Platinum</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Bronze">Bronze</option>
          </select>

          <button className="filter-btn">
            <Filter size={16} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* ===== HOSTS TABLE/GRID VIEW ===== */}
      {viewMode === 'table' ? (
        <div className="table-wrapper">
          <table className="host-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedHosts.length === filteredHosts.length && filteredHosts.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th onClick={() => handleSort('hostEmail')} className="sortable">
                  Email <ArrowUpDown size={14} />
                </th>
                <th onClick={() => handleSort('hostName')} className="sortable">
                  Name <ArrowUpDown size={14} />
                </th>
                <th onClick={() => handleSort('totalRooms')} className="sortable">
                  Rooms <ArrowUpDown size={14} />
                </th>
                <th onClick={() => handleSort('totalRevenue')} className="sortable">
                  Total Revenue <ArrowUpDown size={14} />
                </th>
                <th onClick={() => handleSort('avgRevenue')} className="sortable">
                  Avg Revenue <ArrowUpDown size={14} />
                </th>
                <th>Badge</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHosts.map((host) => (
                <React.Fragment key={host.hostId}>
                  <tr className={selectedHosts.includes(host.hostId) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedHosts.includes(host.hostId)}
                        onChange={() => handleSelectHost(host.hostId)}
                      />
                    </td>
                    <td>
                      <div className="email-cell">
                        <Mail size={14} className="email-icon" />
                        {host.hostEmail}
                      </div>
                    </td>
                    <td>{host.hostName || 'N/A'}</td>
                    <td className="center-cell">{host.totalRooms}</td>
                    <td className="amount-cell">₹ {host.totalRevenue.toLocaleString()}</td>
                    <td className="amount-cell">₹ {Math.round(host.avgRevenue).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${getBadge(host.totalRevenue)}`}>
                        {getBadgeIcon(getBadge(host.totalRevenue))}
                        {getBadge(host.totalRevenue)}
                      </span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button
                          onClick={() => navigate(`/finance/host/${host.hostEmail}`)}
                          className="view-btn"
                        >
                          View Details
                        </button>
                        <button 
                          className="expand-btn"
                          onClick={() => toggleStats(host.hostId)}
                        >
                          {expandedStats[host.hostId] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedStats[host.hostId] && (
                    <tr className="expand-row">
                      <td colSpan="8">
                        <div className="expand-content">
                          <div className="quick-stats">
                            <div className="quick-stat">
                              <span>Revenue per room</span>
                              <strong>₹ {host.totalRooms > 0 
                                ? Math.round(host.totalRevenue / host.totalRooms).toLocaleString() 
                                : 0}</strong>
                            </div>
                            <div className="quick-stat">
                              <span>Performance</span>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill"
                                  style={{
                                    width: `${(host.totalRevenue / Math.max(...hosts.map(h => h.totalRevenue))) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                            <div className="quick-stat">
                              <span>Joined</span>
                              <strong>{host.joinedDate || 'N/A'}</strong>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="hosts-grid">
          {filteredHosts.map((host) => (
            <div key={host.hostId} className={`host-card ${selectedHosts.includes(host.hostId) ? 'selected' : ''}`}>
              <div className="card-header">
                <input
                  type="checkbox"
                  checked={selectedHosts.includes(host.hostId)}
                  onChange={() => handleSelectHost(host.hostId)}
                  className="card-checkbox"
                />
                <span className={`card-badge ${getBadge(host.totalRevenue)}`}>
                  {getBadgeIcon(getBadge(host.totalRevenue))}
                  {getBadge(host.totalRevenue)}
                </span>
              </div>
              
              <div className="card-body">
                <h3 className="host-name">{host.hostName || host.hostEmail.split('@')[0]}</h3>
                <p className="host-email">{host.hostEmail}</p>
                
                <div className="card-stats">
                  <div className="card-stat">
                    <Home size={14} />
                    <span>{host.totalRooms} Rooms</span>
                  </div>
                  <div className="card-stat">
                    <DollarSign size={14} />
                    <span>₹ {host.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="performance-bar">
                  <div 
                    className="performance-fill"
                    style={{
                      width: `${(host.totalRevenue / Math.max(...hosts.map(h => h.totalRevenue))) * 100}%`
                    }}
                  />
                </div>
              </div>
              
              <div className="card-footer">
                <button
                  onClick={() => navigate(`/finance/host/${host.hostEmail}`)}
                  className="card-view-btn"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== BOTTOM STATS ===== */}
      <div className="bottom-stats">
        <div className="stat-item">
          <span className="stat-label">Total Pages:</span>
          <span className="stat-number">{Math.ceil(filteredHosts.length / 10)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Showing:</span>
          <span className="stat-number">{filteredHosts.length} of {hosts.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Selected:</span>
          <span className="stat-number">{selectedHosts.length}</span>
        </div>
      </div>
    </div>
  );
};

export default HostRevenue;