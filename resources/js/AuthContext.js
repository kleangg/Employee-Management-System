import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const isMockMode = window.location.search.includes('mock=true') || process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (token) {
      // Decode token or fetch user info
      // For now, assume token contains user info or fetch from API
      // This is a placeholder; in real app, decode JWT or call /api/user
      setUser({ name: 'Admin User', role: 'HR Admin', email: 'admin@example.com' });
    } else if (isMockMode) {
      // In mock mode, provide a default user
      setUser({ name: 'Mock User', role: 'Employee', email: 'mock@example.com' });
      localStorage.setItem('token', 'mock-token');
      setToken('mock-token');
    }
  }, [token, isMockMode]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};