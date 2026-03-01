import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const normalizeRole = (role) => {
  if (!role) return '';
  if (role === 'traveler') return 'traveller';
  return role.toLowerCase();
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Not logged in → go to login
  if (!user) {
    return (
      <Navigate
        to="/loginweb"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  const userRole = normalizeRole(user.accountType);
  const allowed = allowedRoles.map(normalizeRole);

  // Logged in but forbidden → DO NOTHING (stay where you are)
  if (!allowed.includes(userRole)) {
    console.warn(
      `Access denied: ${userRole} → ${allowed.join(', ')}`
    );
    return null;
  }

  return children;
};

export default ProtectedRoute;
