import { Navigate, Route, Routes } from "react-router-dom";
import { CustomerGroupsPage } from "./CustomerGroupsPage";
import { CustomersPage } from "./CustomersPage";

export function CustomersRoutes() {
  return (
    <Routes>
      <Route index element={<CustomersPage />} />
      <Route path="groups" element={<CustomerGroupsPage />} />
      <Route path="*" element={<Navigate to="/customers" replace />} />
    </Routes>
  );
}
