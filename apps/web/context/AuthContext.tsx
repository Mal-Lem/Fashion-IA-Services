"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, setAccessToken, getAccessToken, setOnAuthError } from "@/lib/api";

export type UserRole = "user" | "couturiere" | "admin";
type RegisterRole = UserRole | "client";

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  avatarUrl?: string;
  isPremium: boolean;
  generationsUsed: number;
  generationsMax: number;
  subscriptionStatus?: string;
  aiCredits?: number;
  morphologyJson?: any;
  gender?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
  updateAvatar: (url: string) => void;
}

interface RegisterData {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  role: RegisterRole;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapUser(apiUser: any): User {
  return {
    id: apiUser.id,
    name: `${apiUser.firstName} ${apiUser.lastName}`,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    email: apiUser.email,
    role: apiUser.role === "user" ? "user" : apiUser.role,
    avatar: apiUser.avatarUrl,
    avatarUrl: apiUser.avatarUrl || undefined,
    isPremium: apiUser.subscriptionStatus === "premium" || apiUser.subscriptionStatus === "pro",
    generationsUsed: apiUser.monthlyGenerationsUsed || 0,
    generationsMax: apiUser.subscriptionStatus === "premium" || apiUser.subscriptionStatus === "pro" ? 999 : 5,
    subscriptionStatus: apiUser.subscriptionStatus,
    aiCredits: apiUser.aiCredits || 0,
    morphologyJson: apiUser.morphologyJson,
    gender: apiUser.gender,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gestionnaire global 401 → déconnexion automatique
    setOnAuthError(() => {
      setUser(null);
      setAccessToken(null);
    });

    const token = getAccessToken();
    if (token) {
      authApi.me()
        .then((apiUser) => setUser(mapUser(apiUser)))
        .catch(() => setAccessToken(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    const res = await authApi.login(email, password, rememberMe);
    setAccessToken(res.access_token);
    setUser(mapUser(res.user));
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    setAccessToken(null);
    setUser(null);
  };

  const register = async (data: RegisterData) => {
  const firstName = data.firstName || data.name?.split(" ")[0] || "";
  const lastName = data.lastName || data.name?.split(" ").slice(1).join(" ") || "";
  const res = await authApi.register({
    firstName,
    lastName,
    email: data.email,
    password: data.password,
    role: (data.role === "client" ? "user" : data.role) as any,
  });
  setAccessToken(res.access_token);
  setUser(mapUser(res.user));
};

  const refreshUser = async () => {
    try {
      const apiUser = await authApi.me();
      setUser(mapUser(apiUser));
    } catch {}
  };

  const updateAvatar = (url: string) => {
  setUser(prev => prev ? { ...prev, avatarUrl: `${url}?t=${Date.now()}` } : null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user, loading, refreshUser, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}