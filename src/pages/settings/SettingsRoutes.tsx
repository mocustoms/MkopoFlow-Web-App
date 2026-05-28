import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SettingsLayout } from "../../layouts/SettingsLayout";
import { AutocodePage } from "./AutocodePage";
import { BranchesSettingsPage } from "./BranchesSettingsPage";
import { ClassificationSettingsPage } from "./ClassificationSettingsPage";
import { CompanySettingsPage } from "./CompanySettingsPage";
import { CurrenciesPage } from "./CurrenciesPage";
import { FinancialYearSettingsPage } from "./FinancialYearSettingsPage";
import { ExpenseCategoriesPage } from "./ExpenseCategoriesPage";
import { InterestSettingsPage } from "./InterestSettingsPage";
import { LoanTypesSettingsPage } from "./LoanTypesSettingsPage";
import { NotificationSettingsPage } from "./NotificationSettingsPage";
import { PenaltySettingsPage } from "./PenaltySettingsPage";
import { RolesSettingsPage } from "./RolesSettingsPage";
import { UsersSettingsPage } from "./UsersSettingsPage";

export function SettingsRoutes() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <Routes>
      <Route path="/" element={<SettingsLayout onSignOut={handleSignOut} />}>
        <Route index element={<Navigate to="company" replace />} />
        <Route path="company" element={<CompanySettingsPage />} />
        <Route path="currencies" element={<CurrenciesPage />} />
        <Route path="financial-year" element={<FinancialYearSettingsPage />} />
        <Route path="expense-categories" element={<ExpenseCategoriesPage />} />
        <Route path="autocode" element={<AutocodePage />} />
        <Route path="interest" element={<InterestSettingsPage />} />
        <Route path="loans" element={<LoanTypesSettingsPage />} />
        <Route path="loan-types" element={<Navigate to="/settings/loans" replace />} />
        <Route path="penalties" element={<PenaltySettingsPage />} />
        <Route path="classification" element={<ClassificationSettingsPage />} />
        <Route path="notifications" element={<NotificationSettingsPage />} />
        <Route path="branches" element={<BranchesSettingsPage />} />
        <Route path="roles" element={<RolesSettingsPage />} />
        <Route path="users" element={<UsersSettingsPage />} />
      </Route>
    </Routes>
  );
}
