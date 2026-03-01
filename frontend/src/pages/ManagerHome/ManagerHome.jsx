import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getManagerHomePath } from '../../utils/managerRouting';

const ManagerHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const department = user?.department || 'Manager';
  const targetPath = getManagerHomePath(department);

  useEffect(() => {
    if (targetPath !== '/manager') {
      navigate(targetPath, { replace: true });
    }
  }, [navigate, targetPath]);

  if (targetPath !== '/manager') {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(135deg, #f7f4ea 0%, #e7ede5 100%)',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '640px',
        width: '100%',
        background: 'rgba(255,255,255,0.92)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 50px rgba(39, 61, 52, 0.12)'
      }}>
        <p style={{ margin: 0, color: '#46625b', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Manager Workspace
        </p>
        <h1 style={{ margin: '10px 0 12px', color: '#1f312c' }}>
          {department} tools are not published yet
        </h1>
        <p style={{ margin: 0, color: '#556862', lineHeight: 1.6 }}>
          Your account is active, but this department dashboard has not been implemented yet. Listings managers
          will be redirected automatically to their listings workspace.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/manager/profile')}
            style={{
              border: '1px solid #9bb2aa',
              borderRadius: '999px',
              padding: '12px 18px',
              background: '#f4f8f5',
              color: '#355149',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/manager-login');
            }}
            style={{
              border: 'none',
              borderRadius: '999px',
              padding: '12px 18px',
              background: '#1f312c',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            Back to Login
          </button>
          <button
            type="button"
            onClick={logout}
            style={{
              border: '1px solid #9bb2aa',
              borderRadius: '999px',
              padding: '12px 18px',
              background: '#fff',
              color: '#355149',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerHome;
