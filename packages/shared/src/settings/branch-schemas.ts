import { z } from "zod";

const optionalPhone = z
  .union([z.string().min(5, "Phone number is required").max(32), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" || v == null ? null : v.trim()));

export const branchSchema = z.object({
  name: z.string().min(2, "Branch name is required"),
  address: z
    .union([z.string().max(500), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v == null ? null : v.trim())),
  phone: optionalPhone,
  isActive: z.boolean().default(true),
});

export const updateUserBranchesSchema = z.object({
  branchIds: z.array(z.string()),
});

export type BranchInput = z.infer<typeof branchSchema>;
export type UpdateUserBranchesInput = z.infer<typeof updateUserBranchesSchema>;
