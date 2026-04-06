import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => boolean;
  adminLogin: (username: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  adminLogout: () => void;
  resetPassword: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("findit_user");
    if (stored) setUser(JSON.parse(stored));
    const adminSession = localStorage.getItem("findit_admin");
    if (adminSession === "true") setIsAdmin(true);
  }, []);

  const register = (name: string, email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem("findit_users") || "[]");
    if (users.find((u: any) => u.email === email)) return false;
    const newUser = { id: crypto.randomUUID(), name, email, password };
    users.push(newUser);
    localStorage.setItem("findit_users", JSON.stringify(users));
    const { password: _, ...safe } = newUser;
    setUser(safe);
    localStorage.setItem("findit_user", JSON.stringify(safe));
    return true;
  };

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem("findit_users") || "[]");
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (!found) return false;
    const { password: _, ...safe } = found;
    setUser(safe);
    localStorage.setItem("findit_user", JSON.stringify(safe));
    return true;
  };

  const adminLogin = (username: string, password: string): boolean => {
    if (username === "admin" && password === "admin") {
      setIsAdmin(true);
      localStorage.setItem("findit_admin", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("findit_user");
  };

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("findit_admin");
  };

  const resetPassword = (email: string): boolean => {
    const users = JSON.parse(localStorage.getItem("findit_users") || "[]");
    return users.some((u: any) => u.email === email);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, adminLogin, register, logout, adminLogout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
