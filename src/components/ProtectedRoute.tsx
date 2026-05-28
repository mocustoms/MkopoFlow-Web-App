import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Dashboard and other app pages — must be signed in with a company. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isFullyOnboarded } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!isFullyOnboarded) {
    return <Navigate to="/register-company" replace />;
  }

  return children;
}
