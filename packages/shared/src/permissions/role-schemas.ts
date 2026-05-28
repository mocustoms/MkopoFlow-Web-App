import { z } from "zod";
import { getLeafResourceKeys } from "./modules.js";

const leafKeys = new Set(getLeafResourceKeys());

export const permissionFlagsSchema = z.object({
  canAdd: z.boolean(),
  canEdit: z.boolean(),
  canView: z.boolean(),
  canDelete: z.boolean(),
  canPrintExcel: z.boolean(),
  canPrintPdf: z.boolean(),
});

export const rolePermissionEntrySchema = permissionFlagsSchema.extend({
  resourceKey: z.string().refine((k) => leafKeys.has(k), "Invalid resource key"),
});

export const tenantRoleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  code: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[A-Z][A-Z0-9_]*$/, "Code must be uppercase letters, numbers, and underscores"),
  description: z
    .union([z.string().max(500), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v == null ? null : v.trim())),
  isActive: z.boolean().default(true),
  permissions: z.array(rolePermissionEntrySchema),
});

export const updateUserRoleAssignmentSchema = z.object({
  tenantRoleId: z.string().min(1).nullable(),
});

export type PermissionFlagsInput = z.infer<typeof permissionFlagsSchema>;
export type RolePermissionEntryInput = z.infer<typeof rolePermissionEntrySchema>;
export type TenantRoleInput = z.infer<typeof tenantRoleSchema>;
