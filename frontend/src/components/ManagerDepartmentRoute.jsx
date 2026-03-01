import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getManagerHomePath, normalizeManagerDepartment } from '../utils/managerRouting';

const ManagerDepartmentRoute = ({ children, allowedDepartments = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/manager-login" replace state={{ from: location.pathname }} />;
  }

  if (String(user.accountType || '').toLowerCase() !== 'manager') {
    return <Navigate to="/loginweb" replace />;
  }

  if (allowedDepartments.length > 0) {
    const managerDepartment = normalizeManagerDepartment(user.department);
    const matchesDepartment = allowedDepartments
      .map(normalizeManagerDepartment)
      .includes(managerDepartment);

    if (!matchesDepartment) {
      return <Navigate to={getManagerHomePath(user.department)} replace />;
    }
  }

  return children;
};

export default ManagerDepartmentRoute;
