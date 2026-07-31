import React, { createContext, useState } from 'react';
import { USER_PROFILE } from '../constants/mockData';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(USER_PROFILE);
  const [token, setToken] = useState('jwt_mock_token_12345');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authService.loginWithPassword(username, password);
      setUser(res.user);
      setToken(res.token);
      setIsAuthenticated(true);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (farmerData) => {
    setLoading(true);
    try {
      const res = await authService.registerFarmer(farmerData);
      setUser(res.user);
      setToken(res.token);
      setIsAuthenticated(true);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
