import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Company registration — must be signed in but not yet have a company. */
export function OnboardingRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isFullyOnboarded } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/create-account" replace />;
  }
  if (isFullyOnboarded) {
    return <Navigate to="/" replace />;
  }

  return children;
}
