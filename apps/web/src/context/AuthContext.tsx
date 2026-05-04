import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const TOKEN_KEY = "dipwise_token";

export interface AuthUser {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  setSession: (token: string | null, user: AuthUser | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!!readStoredToken());

  const setSession = useCallback((t: string | null, u: AuthUser | null) => {
    setToken(t);
    setUser(u);
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  }, []);

  const logout = useCallback(() => {
    setSession(null, null);
  }, [setSession]);

  const refreshUser = useCallback(async () => {
    const t = readStoredToken();
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    setToken(t);
    const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
    const res = await fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!res.ok) {
      setSession(null, null);
      setLoading(false);
      return;
    }
    const data = (await res.json()) as AuthUser;
    setUser(data);
    setLoading(false);
  }, [setSession]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({ token, user, loading, setSession, logout, refreshUser }),
    [token, user, loading, setSession, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getStoredToken(): string | null {
  return readStoredToken();
}
