import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import { toast } from "sonner";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { user } = await authService.getMe();
        setUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        // Backend returned 401
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  // Register
  const register = async (userData) => {
    return await authService.register(userData);
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {}
    setUser(null);
    setIsAuthenticated(false);
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
