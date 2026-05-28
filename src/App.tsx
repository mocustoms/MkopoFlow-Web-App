import { Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute } from "./components/GuestRoute";
import { OnboardingRoute } from "./components/OnboardingRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CreateAccountPage } from "./pages/CreateAccountPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JoinCompanyPage } from "./pages/JoinCompanyPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterCompanyPage } from "./pages/RegisterCompanyPage";
import { CustomersRoutes } from "./pages/customers/CustomersRoutes";
import { FinancingRoutes } from "./pages/financing/FinancingRoutes";
import { SettingsRoutes } from "./pages/settings/SettingsRoutes";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/create-account"
          element={
            <GuestRoute>
              <CreateAccountPage />
            </GuestRoute>
          }
        />
        <Route
          path="/join-company"
          element={
            <GuestRoute>
              <JoinCompanyPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register-company"
          element={
            <OnboardingRoute>
              <RegisterCompanyPage />
            </OnboardingRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/*"
          element={
            <ProtectedRoute>
              <CustomersRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/branches/*"
          element={
            <ProtectedRoute>
              <Navigate to="/settings/branches" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/chart-of-accounts/*"
          element={
            <ProtectedRoute>
              <Navigate to="/financing/chart-of-accounts" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/financing/*"
          element={
            <ProtectedRoute>
              <FinancingRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/*"
          element={
            <ProtectedRoute>
              <SettingsRoutes />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
