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
  const [token, setToken] = useState<string | null>(null);

  // Debug state changes
  useEffect(() => {
    const computedIsAuthenticated = !!user && !!token;
    console.log("🔄 AuthContext state changed:", {
      user: user?.username,
      userRole: user?.role,
      token: token ? "present" : "none",
      isAuthenticated: computedIsAuthenticated,
      isLoading,
    });
  }, [user, token, isLoading]);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("authToken");
      console.log(
        "🔍 Checking stored token:",
        storedToken ? "present" : "none"
      );

      if (storedToken) {
        try {
          console.log("🔍 Fetching profile with stored token...");
          apiClient.setToken(storedToken);
          const profileResponse = await apiClient.getProfile();

          if (profileResponse.success && profileResponse.data) {
            console.log("🔍 Profile response:", profileResponse);
            console.log("🔍 Profile data:", profileResponse.data);

            // Backend returns { success: true, data: { user: {...} } }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const userData = (profileResponse.data as any).user;
            console.log("🔍 User data:", userData);

            if (userData) {
              console.log(
                "✅ Auto-login successful:",
                userData.username,
                "Role:",
                userData.role
              );
              setToken(storedToken);
              setUser(userData);
            } else {
              console.log("❌ User data not found in response");
              localStorage.removeItem("authToken");
              apiClient.setToken(null);
              setToken(null);
              setUser(null);
            }
          } else {
            console.log("❌ Profile fetch failed, clearing token");
            localStorage.removeItem("authToken");
            apiClient.setToken(null);
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error("❌ Auto login failed:", error);
          localStorage.removeItem("authToken");
          apiClient.setToken(null);
          setToken(null);
          setUser(null);
        }
      } else {
        console.log("🔍 No stored token found");
        setToken(null);
        setUser(null);
      }

      console.log("✅ Auth check completed, setting isLoading to false");
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData: User, authToken: string) => {
    console.log("🔐 AuthContext.login called with:", { userData, authToken });
    // Update API client with new token
    apiClient.setToken(authToken);
    // Store token in localStorage
    localStorage.setItem("authToken", authToken);
    setToken(authToken);
    setUser(userData);
    console.log("✅ AuthContext state updated", {
      newUser: userData,
      newToken: authToken,
      willBeAuthenticated: !!(userData && authToken),
    });
  };

  const logout = () => {
    apiClient.setToken(null);
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  const refetchProfile = async () => {
    if (token) {
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

  // Simple and reliable authentication check
  const isAuthenticated = !!user && !!token;

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
