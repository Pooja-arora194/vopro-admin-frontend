import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vopro_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vopro_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('vopro_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('vopro_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('vopro_token', res.data.token);
      localStorage.setItem('vopro_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const demoLogin = async (roleType) => {
    const res = await api.post('/auth/demo-login', { roleType });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('vopro_token', res.data.token);
      localStorage.setItem('vopro_user', JSON.stringify(res.data.user));
      return res.data;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vopro_token');
    localStorage.removeItem('vopro_user');
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('vopro_user', JSON.stringify(updated));
  };

  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
  const isCustomer = user && (user.role === 'customer_admin' || user.role === 'customer_user');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        demoLogin,
        logout,
        updateUser,
        isAdmin,
        isCustomer,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
