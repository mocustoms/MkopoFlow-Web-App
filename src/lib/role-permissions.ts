import {
  emptyPermissionFlags,
  getLeafResourceKeys,
  type PermissionFlags,
  type RolePermissionEntryInput,
} from "@mkopoflow/shared";

export function mergeRolePermissions(
  permissions: RolePermissionEntryInput[],
): RolePermissionEntryInput[] {
  const map = new Map(permissions.map((p) => [p.resourceKey, p]));
  return getLeafResourceKeys().map((resourceKey: string) => {
    const existing = map.get(resourceKey);
    return existing ?? { resourceKey, ...emptyPermissionFlags() };
  });
}

export function permissionsToMap(
  permissions: RolePermissionEntryInput[],
): Record<string, PermissionFlags> {
  return Object.fromEntries(
    mergeRolePermissions(permissions).map((p) => [
      p.resourceKey,
      {
        canAdd: p.canAdd,
        canEdit: p.canEdit,
        canView: p.canView,
        canDelete: p.canDelete,
        canPrintExcel: p.canPrintExcel,
        canPrintPdf: p.canPrintPdf,
      },
    ]),
  );
}

export function mapToPermissions(
  map: Record<string, PermissionFlags>,
): RolePermissionEntryInput[] {
  return mergeRolePermissions(
    Object.entries(map).map(([resourceKey, flags]) => ({ resourceKey, ...flags })),
  );
}
