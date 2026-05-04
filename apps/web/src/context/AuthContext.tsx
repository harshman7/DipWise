import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loginAuthLoginPost,
  meAuthMeGet,
  registerAuthRegisterPost,
  type UserResponse,
} from "@dipwise/shared";

const TOKEN_KEY = "dipwise_token";

type AuthContextValue = {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName?: string | null,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof localStorage !== "undefined"
      ? localStorage.getItem(TOKEN_KEY)
      : null,
  );
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(!!token);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    const res = await meAuthMeGet();
    if (res.status === 200) {
      setUser(res.data);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginAuthLoginPost({ email, password });
    if (res.status !== 200) {
      const d = res.data as { detail?: string };
      throw new Error(typeof d?.detail === "string" ? d.detail : "Login failed");
    }
    const access = res.data.access_token;
    localStorage.setItem(TOKEN_KEY, access);
    setToken(access);
    setLoading(true);
    const me = await meAuthMeGet();
    if (me.status === 200) {
      setUser(me.data);
    }
    setLoading(false);
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName?: string | null) => {
      const res = await registerAuthRegisterPost({
        email,
        password,
        full_name: fullName ?? null,
      });
      if (res.status !== 201) {
        const d = res.data as { detail?: string };
        throw new Error(
          typeof d?.detail === "string" ? d.detail : "Registration failed",
        );
      }
      await login(email, password);
    },
    [login],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
