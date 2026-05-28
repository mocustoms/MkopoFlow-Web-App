import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FinancingLayout } from "../../layouts/FinancingLayout";
import { ChartOfAccountsPage } from "./ChartOfAccountsPage";

export function FinancingRoutes() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <Routes>
      <Route path="/" element={<FinancingLayout onSignOut={handleSignOut} />}>
        <Route index element={<Navigate to="chart-of-accounts" replace />} />
        <Route path="chart-of-accounts" element={<ChartOfAccountsPage />} />
      </Route>
    </Routes>
  );
}
