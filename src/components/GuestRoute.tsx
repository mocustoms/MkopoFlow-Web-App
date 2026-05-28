import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Login / sign-up pages — redirect if already fully onboarded. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isFullyOnboarded, needsCompanyRegistration } = useAuth();

  if (isAuthenticated && needsCompanyRegistration) {
    return <Navigate to="/register-company" replace />;
  }
  if (isFullyOnboarded) {
    return <Navigate to="/" replace />;
  }

  return children;
}
