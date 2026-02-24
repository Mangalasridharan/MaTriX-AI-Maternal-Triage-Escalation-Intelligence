"use client";
/**
 * MaTriX-AI Auth Context
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps the entire app. Provides:
 *  - `user`     current authenticated user profile (or null)
 *  - `loading`  true while validating the stored JWT on first mount
 *  - `login()`  POST credentials → store JWT → fetch /me → update state
 *  - `signup()` POST new account → auto-login → redirect to dashboard
 *  - `logout()` clear token → redirect to /login
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface UserProfile {
  id: string;
  username: string;
  clinic_name: string;
  role: string;
  created_at: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, clinic_name: string) => Promise<void>;
  logout: () => void;
}

/* ─── Context ────────────────────────────────────────────────────────────── */
const AuthContext = createContext<AuthContextValue | null>(null);

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Axios instance — always attaches JWT if present */
export const authHttp = axios.create({ baseURL: BASE });
authHttp.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const tok = localStorage.getItem("matrix_token");
    if (tok) cfg.headers.Authorization = `Bearer ${tok}`;
  }
  return cfg;
});

/* ─── Provider ───────────────────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /** Fetch current user profile using stored token */
  const fetchMe = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const { data } = await authHttp.get<UserProfile>("/api/auth/me");
      setUser(data);
      return data;
    } catch {
      localStorage.removeItem("matrix_token");
      setUser(null);
      return null;
    }
  }, []);

  /* On first mount — validate any existing token */
  useEffect(() => {
    const token = localStorage.getItem("matrix_token");
    if (token) {
      fetchMe().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  /* ── Login ─────────────────────────────────────────────────────────────── */
  const login = useCallback(async (username: string, password: string) => {
    const fd = new URLSearchParams({ username, password });
    const { data } = await authHttp.post<{ access_token: string }>(
      "/api/auth/token",
      fd,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    localStorage.setItem("matrix_token", data.access_token);
    await fetchMe();
    router.push("/dashboard");
  }, [fetchMe, router]);

  /* ── Signup then auto-login ─────────────────────────────────────────────── */
  const signup = useCallback(async (
    username: string,
    password: string,
    clinic_name: string
  ) => {
    await authHttp.post("/api/auth/signup", { username, password, clinic_name });
    // Auto-login immediately after successful signup
    await login(username, password);
  }, [login]);

  /* ── Logout ─────────────────────────────────────────────────────────────── */
  const logout = useCallback(() => {
    localStorage.removeItem("matrix_token");
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
