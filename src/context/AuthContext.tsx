import type { AuthResponse } from "@mkopoflow/shared";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "mkopoflow.auth";

type AuthState = AuthResponse | null;

type AuthContextValue = {
  auth: AuthState;
  isAuthenticated: boolean;
  needsCompanyRegistration: boolean;
  isFullyOnboarded: boolean;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeAuth(stored: AuthResponse): AuthResponse {
  const needs =
    stored.user.onboardingStatus === "PENDING_COMPANY" || stored.tenant === null;
  const normalized = {
    ...stored,
    user: { ...stored.user, permissions: stored.user.permissions ?? {} },
  };
  if (stored.needsCompanyRegistration === needs) {
    return normalized;
  }
  return { ...normalized, needsCompanyRegistration: needs };
}

function loadStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeAuth(JSON.parse(raw) as AuthResponse);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuthState] = useState<AuthState>(loadStoredAuth);

  const setAuth = useCallback((next: AuthResponse) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAuthState(next);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthState(null);
  }, []);

  const needsCompanyRegistration = auth?.needsCompanyRegistration ?? false;
  const isFullyOnboarded = auth !== null && !needsCompanyRegistration;

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: auth !== null,
      needsCompanyRegistration,
      isFullyOnboarded,
      setAuth,
      logout,
    }),
    [auth, needsCompanyRegistration, isFullyOnboarded, setAuth, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
