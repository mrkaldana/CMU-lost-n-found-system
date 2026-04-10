import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";
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
  requestRegistrationOtp: (email: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  adminLogout: () => Promise<void>;
  requestPasswordResetOtp: (email: string) => Promise<boolean>;
  verifyPasswordResetOtp: (email: string, otp: string) => Promise<boolean>;
  resetPasswordWithOtp: (email: string, otp: string, newPassword: string) => Promise<boolean>;
  updateProfile: (payload: { name: string; email: string; currentPassword?: string; newPassword?: string }) => Promise<{ ok: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AUTH_ASSET_PATHS = ["/findit.png", "/cover.jpg"] as const;
const AUTH_LOADING_MIN_MS = 1000;

const preloadImage = (src: string) =>
  new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });

const preloadAuthAssets = async () => {
  await Promise.all(AUTH_ASSET_PATHS.map((src) => preloadImage(src)));
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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

  const requestRegistrationOtp = async (email: string): Promise<boolean> => {
    try {
      await apiRequest<{ ok: true }>("/api/auth/register/request-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, otp: string): Promise<boolean> => {
    try {
      const data = await apiRequest<{ token: string; user: User }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, otp }),
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
    const loadingStartedAt = Date.now();
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
      await preloadAuthAssets();
      return true;
    } catch {
      return false;
    } finally {
      const elapsed = Date.now() - loadingStartedAt;
      if (elapsed < AUTH_LOADING_MIN_MS) {
        await wait(AUTH_LOADING_MIN_MS - elapsed);
      }
      setIsLoginLoading(false);
    }
  };

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    const loadingStartedAt = Date.now();
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
      await preloadAuthAssets();
      return true;
    } catch {
      return false;
    } finally {
      const elapsed = Date.now() - loadingStartedAt;
      if (elapsed < AUTH_LOADING_MIN_MS) {
        await wait(AUTH_LOADING_MIN_MS - elapsed);
      }
      setIsLoginLoading(false);
    }
  };

  const logout = async () => {
    const loadingStartedAt = Date.now();
    setIsLogoutLoading(true);
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem("findit_user");
    localStorage.removeItem("findit_token");
    await preloadAuthAssets();
    const elapsed = Date.now() - loadingStartedAt;
    if (elapsed < AUTH_LOADING_MIN_MS) {
      await wait(AUTH_LOADING_MIN_MS - elapsed);
    }
    setIsLogoutLoading(false);
  };

  const adminLogout = async () => {
    await logout();
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
    <AuthContext.Provider value={{ user, isAdmin, token, isAuthReady, isLoginLoading, isLogoutLoading, isProfileUpdating, login, adminLogin, requestRegistrationOtp, register, logout, adminLogout, requestPasswordResetOtp, verifyPasswordResetOtp, resetPasswordWithOtp, updateProfile }}>
      {children}
      {(isLoginLoading || isLogoutLoading) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-sm">
          <div className="rounded-xl border bg-card px-6 py-5 shadow-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm font-medium text-card-foreground">
                {isLogoutLoading ? "Signing out..." : "Signing in..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
