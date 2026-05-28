import { useAuth } from "../context/AuthContext";
import type { PermissionAction } from "@mkopoflow/shared";

export function useSettingsToken(): string | null {
  const { auth, isFullyOnboarded } = useAuth();
  if (!isFullyOnboarded || !auth?.token) return null;
  return auth.token;
}

export function useIsAdmin(): boolean {
  const { auth } = useAuth();
  return auth?.user.role === "ADMIN";
}

export function useCan(resourceKey: string, action: PermissionAction): boolean {
  const { auth } = useAuth();
  if (auth?.user.role === "ADMIN") return true;
  const permissions = auth?.user.permissions;
  const flags = permissions?.[resourceKey];
  if (!flags) return false;
  if (action === "add") return flags.canAdd;
  if (action === "edit") return flags.canEdit;
  if (action === "view") return flags.canView;
  if (action === "delete") return flags.canDelete;
  if (action === "printExcel") return flags.canPrintExcel;
  return flags.canPrintPdf;
}

export function useCanManageStaff(): boolean {
  return useCan("customers.list", "add") || useCan("customers.list", "edit");
}
