import { z } from "zod";
import { permissionFlagsSchema } from "../permissions/role-schemas.js";

const companySlug = z
  .string()
  .min(2, "Company code must be at least 2 characters")
  .max(48)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only");

const password = z.string().min(8, "Password must be at least 8 characters");

/** Sign in — email and password only (after company is registered). */
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password,
});

const phone = z.string().min(5, "Phone number is required").max(32);

/** Step 1: Create personal account (no company yet). */
export const registerAccountSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone,
  email: z.string().email("Enter a valid email"),
  password,
});

/** Step 2: Register company (authenticated user, onboarding). */
export const registerCompanySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companySlug,
});

/** Join an existing company (invite-style flow). */
export const joinCompanySchema = z.object({
  companySlug,
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password,
});

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  role: z.enum(["ADMIN", "LOAN_OFFICER", "VIEWER"]),
  onboardingStatus: z.enum(["PENDING_COMPANY", "ACTIVE"]),
  permissions: z.record(z.string(), permissionFlagsSchema).default({}),
});

export const authTenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const authResponseSchema = z.object({
  token: z.string(),
  user: authUserSchema,
  tenant: authTenantSchema.nullable(),
  needsCompanyRegistration: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterAccountInput = z.infer<typeof registerAccountSchema>;
export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
export type JoinCompanyInput = z.infer<typeof joinCompanySchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
