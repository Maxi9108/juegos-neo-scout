import React, { createContext, useContext, useState, useEffect } from 'react';
import { sheetService, SUPERADMIN_CREDENTIALS } from '../services/sheetService';

const AUTH_USER_KEY = 'preguntados_current_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const login = async (email, password) => {
    const user = await sheetService.login(email, password);
    setCurrentUser(user);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  };

  const register = async (email, password, name, extra = {}) => {
    const user = await sheetService.register(email, password, name, extra);
    setCurrentUser(user);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const isSuperAdmin = currentUser?.rol === 'superadmin' ||
    currentUser?.email?.toLowerCase() === SUPERADMIN_CREDENTIALS.email.toLowerCase();

  const isAdmin = isSuperAdmin || currentUser?.rol === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isSuperAdmin,
        isAdmin,
        isOnline,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
