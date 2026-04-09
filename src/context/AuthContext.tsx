import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  token: string | null;
  isAuthReady: boolean;
  isLoginLoading: boolean;
  isLogoutLoading: boolean;
  isProfileUpdating: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  adminLogout: () => void;
  requestPasswordResetOtp: (email: string) => Promise<boolean>;
  verifyPasswordResetOtp: (email: string, otp: string) => Promise<boolean>;
  resetPasswordWithOtp: (email: string, otp: string, newPassword: string) => Promise<boolean>;
  updateProfile: (payload: { name: string; email: string; currentPassword?: string; newPassword?: string }) => Promise<{ ok: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("findit_user");
    if (stored) {
      const parsed = JSON.parse(stored) as User;
      setUser(parsed);
      setIsAdmin(parsed.role === "admin");
    }
    const storedToken = localStorage.getItem("findit_token");
    if (storedToken) setToken(storedToken);
    setIsAuthReady(true);
  }, []);

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiRequest<{ token: string; user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      setUser(data.user);
      setIsAdmin(data.user.role === "admin");
      setToken(data.token);
      localStorage.setItem("findit_user", JSON.stringify(data.user));
      localStorage.setItem("findit_token", data.token);
      return true;
    } catch {
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoginLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      setIsAdmin(data.user.role === "admin");
      setToken(data.token);
      localStorage.setItem("findit_user", JSON.stringify(data.user));
      localStorage.setItem("findit_token", data.token);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoginLoading(false);
    }
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    setIsLoginLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: User }>("/api/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      setUser(data.user);
      setIsAdmin(true);
      setToken(data.token);
      localStorage.setItem("findit_user", JSON.stringify(data.user));
      localStorage.setItem("findit_token", data.token);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoginLoading(false);
    }
  };

  const logout = () => {
    setIsLogoutLoading(true);
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem("findit_user");
    localStorage.removeItem("findit_token");
    setIsLogoutLoading(false);
  };

  const adminLogout = () => {
    logout();
  };

  const requestPasswordResetOtp = async (email: string): Promise<boolean> => {
    try {
      await apiRequest<{ ok: true }>("/api/auth/forgot-password/request-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return true;
    } catch {
      return false;
    }
  };

  const verifyPasswordResetOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      await apiRequest<{ ok: true }>("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      return true;
    } catch {
      return false;
    }
  };

  const resetPasswordWithOtp = async (email: string, otp: string, newPassword: string): Promise<boolean> => {
    try {
      await apiRequest<{ ok: true }>("/api/auth/forgot-password/reset", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword }),
      });
      return true;
    } catch {
      return false;
    }
  };

  const updateProfile = async (payload: { name: string; email: string; currentPassword?: string; newPassword?: string }): Promise<{ ok: boolean; message?: string }> => {
    if (!token) return { ok: false, message: "Not authenticated" };
    setIsProfileUpdating(true);
    try {
      const data = await apiRequest<{ token: string; user: User }>("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
        token,
      });
      setUser(data.user);
      setIsAdmin(data.user.role === "admin");
      setToken(data.token);
      localStorage.setItem("findit_user", JSON.stringify(data.user));
      localStorage.setItem("findit_token", data.token);
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update profile";
      return { ok: false, message };
    } finally {
      setIsProfileUpdating(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, token, isAuthReady, isLoginLoading, isLogoutLoading, isProfileUpdating, login, adminLogin, register, logout, adminLogout, requestPasswordResetOtp, verifyPasswordResetOtp, resetPasswordWithOtp, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
