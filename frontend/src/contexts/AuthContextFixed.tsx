// Authentication Context
import React, { createContext, useEffect, useState } from "react";
import { apiClient } from "../lib/api";
import type { User } from "../types/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  refetchProfile: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          apiClient.setToken(token);
          const profileResponse = await apiClient.getProfile();
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data);
          }
        } catch (error) {
          console.error("Auto login failed:", error);
          localStorage.removeItem("authToken");
          apiClient.setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData: User, token: string) => {
    // Update API client with new token
    apiClient.setToken(token);
    setUser(userData);
  };

  const logout = () => {
    apiClient.setToken(null);
    setUser(null);
  };

  const refetchProfile = async () => {
    if (localStorage.getItem("authToken")) {
      try {
        const profileResponse = await apiClient.getProfile();
        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data);
        }
      } catch (error) {
        console.error("Profile refetch failed:", error);
      }
    }
  };

  const isAuthenticated = !!user && !!localStorage.getItem("authToken");

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
