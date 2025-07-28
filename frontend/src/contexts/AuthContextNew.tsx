// Authentication Context
import React, { createContext, useEffect, useState } from "react";
import { useProfile, useLogout } from "../hooks/api";
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
  const { data: profileData, isLoading, refetch } = useProfile();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (profileData?.data) {
      setUser(profileData.data);
    } else {
      setUser(null);
    }
  }, [profileData]);

  const login = (userData: User, token: string) => {
    // Update API client with new token
    apiClient.setToken(token);
    setUser(userData);
    // Refetch profile to ensure user data is up to date
    refetch();
  };

  const logout = () => {
    logoutMutation.mutate();
    apiClient.setToken(null);
    setUser(null);
  };

  const refetchProfile = () => {
    refetch();
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
