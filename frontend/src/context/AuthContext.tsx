import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [roles, setRoles] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setRoles([]);
    setIsAuthenticated(false);
  };

  // Fetch current profile on mount or token change
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');
        if (response.success && response.data) {
          const fetchedUser: AuthUser = response.data;
          setUser(fetchedUser);
          setRoles(fetchedUser.roles || []);
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Failed to verify stored auth token:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Event listener for unauthorized event triggered by API client on 401
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.success && response.data) {
        const { user: loggedInUser, token: receivedToken } = response.data;
        localStorage.setItem('token', receivedToken);
        setUser(loggedInUser);
        setRoles(loggedInUser.roles || []);
        setToken(receivedToken);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        roles,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
