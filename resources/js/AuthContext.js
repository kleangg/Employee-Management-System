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
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Opt-in mock mode: append ?mock=true to the URL to run against MSW mocks.
  const isMockMode = window.location.search.includes('mock=true');

  // On mount, if we have a token but no user yet, fetch profile from backend.
  useEffect(() => {
    let cancelled = false;

    async function hydrateUser() {
      if (isMockMode && !token) {
        const mockUser = { name: 'Mock User', role: 'employee', email: 'mock@example.com' };
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        if (!cancelled) {
          setToken('mock-token');
          setUser(mockUser);
        }
        return;
      }

      if (token && !user) {
        try {
          const res = await fetch('/api/auth/user-profile', {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (!cancelled) {
              setUser(data);
              localStorage.setItem('user', JSON.stringify(data));
            }
          } else if (res.status === 401) {
            // Token expired/invalid — clear and kick to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!cancelled) {
              setToken(null);
              setUser(null);
            }
          }
        } catch (err) {
          // Network error — keep existing state, don't crash the app
          console.warn('Failed to fetch profile:', err);
        }
      }
    }

    hydrateUser();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Called by login.jsx after a successful /api/auth/login call.
  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  // Logs the user out on both frontend and backend.
  const logout = async () => {
    const current = localStorage.getItem('token');
    // Try to tell the backend first, but don't block the UI if it fails.
    if (current && current !== 'mock-token') {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${current}`,
            Accept: 'application/json',
          },
        });
      } catch (err) {
        console.warn('Logout request failed:', err);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
