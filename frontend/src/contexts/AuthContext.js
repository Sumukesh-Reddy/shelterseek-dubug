import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuthenticatedSession = (authToken, authUser) => {
    const normalizedUser = {
      ...authUser,
      _id: authUser?._id || authUser?.id,
    };

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    sessionStorage.setItem('currentUser', JSON.stringify(normalizedUser));
    axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;

    setToken(authToken);
    setUser(normalizedUser);

    return normalizedUser;
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setAuthenticatedSession(storedToken, JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });

      if (response.data.success) {
        const { token: authToken, user: authUser } = response.data;
        setAuthenticatedSession(authToken, authUser);
        return { success: true, user: authUser };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');
    delete axios.defaults.headers.common.Authorization;
  };

  const value = {
    user,
    token,
    login,
    setAuthenticatedSession,
    logout,
    loading,
    isAuthenticated: !!user && !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
