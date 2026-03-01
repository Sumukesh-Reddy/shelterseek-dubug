import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HomePage from '../pages/HomePage/HomePage';

const normalizeRole = (role) => {
  if (!role) return '';
  if (role === 'traveler') return 'traveller';
  return role.toLowerCase();
};

const RoleHome = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    // Not logged in → traveler landing page
    return <HomePage />;
  }

  const role = normalizeRole(user.accountType);

  if (role === 'host') {
    return <Navigate to="/host_index" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/AdminDashboard" replace />;
  }

  // Traveller stays on homepage
  return <HomePage />;
};

export default RoleHome;
