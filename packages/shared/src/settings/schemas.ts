import { z } from "zod";

export const interestMethodSchema = z.enum(["REDUCING_BALANCE", "FIXED_FLAT", "CUSTOM"]);
export const paymentFrequencySchema = z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"]);
export const penaltyTypeSchema = z.enum(["PERCENTAGE", "FLAT"]);
export const classificationCodeSchema = z.enum([
  "CURRENT",
  "WATCH",
  "SUB_STANDARD",
  "DOUBTFUL",
  "LOSS",
]);
export const accountTypeSchema = z.enum(["ASSET", "LIABILITY", "REVENUE", "EXPENSE"]);

const optionalEmail = z.union([
  z.string().email("Enter a valid email"),
  z.literal(""),
  z.null(),
]);

export const companySettingsSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  logoUrl: z
    .union([z.string().max(500_000, "Logo image is too large"), z.literal(""), z.null()])
    .optional(),
  phone: z.union([z.string().max(32), z.literal(""), z.null()]).optional(),
  email: optionalEmail.optional(),
  address: z.union([z.string().max(500), z.literal(""), z.null()]).optional(),
  businessRegistrationNo: z.union([z.string().max(64), z.literal(""), z.null()]).optional(),
  defaultCurrencyId: z.union([z.string().min(1), z.literal(""), z.null()]).optional(),
});

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format");

export const financialYearSchema = z
  .object({
    name: z.string().min(2, "Financial year name is required"),
    startDate: isoDateSchema,
    endDate: isoDateSchema,
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

/** @deprecated Use financialYearSchema */
export const financialYearSettingsSchema = financialYearSchema;

export const currencySchema = z.object({
  name: z.string().min(2, "Currency name is required"),
  symbol: z.string().min(1, "Symbol is required").max(8, "Symbol is too long"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

/** Expense category input — code is auto-generated via Settings → Autocode (EXPENSE module). */
export const expenseCategorySchema = z.object({
  name: z.string().min(2, "Expense name is required"),
  description: z
    .union([z.string().max(500), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v == null ? null : v.trim())),
  isActive: z.boolean().default(true),
  expenseAccountId: z.string().min(1, "Expense account is required"),
  liabilityAccountId: z.string().min(1, "Liability account is required"),
});

export const interestSettingsSchema = z.object({
  defaultInterestMethod: interestMethodSchema,
  defaultAnnualRatePct: z.coerce.number().min(0).max(1000),
  customFormulaNotes: z
    .union([z.string().max(2000), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v == null ? undefined : v)),
});

/** @deprecated Use interestSettingsSchema */
export const loanSettingsSchema = interestSettingsSchema;

export const loanTypeSchema = z.object({
  name: z.string().min(2, "Loan type name is required"),
  description: z
    .union([z.string().max(500), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v == null ? null : v.trim())),
  paymentFrequency: paymentFrequencySchema,
  isActive: z.boolean().default(true),
});

export const penaltySettingsSchema = z.object({
  enabled: z.boolean(),
  graceDays: z.coerce.number().int().min(0).max(365),
  penaltyType: penaltyTypeSchema,
  rateOrAmount: z.coerce.number().min(0),
});

export const classificationRuleSchema = z.object({
  code: classificationCodeSchema,
  label: z.string().min(2),
  minDaysPastDue: z.coerce.number().int().min(0),
  maxDaysPastDue: z.coerce.number().int().min(0).nullable().optional(),
  provisionRatePct: z.coerce.number().min(0).max(100).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0),
});

export const classificationRulesSchema = z.array(classificationRuleSchema).min(1);

export const notificationSettingsSchema = z.object({
  smsEnabled: z.boolean(),
  smsProvider: z.string().optional(),
  smsSenderId: z.string().optional(),
  reminderHoursBeforeDue: z.coerce.number().int().min(1).max(168),
  alertOnRiskClassification: z.boolean(),
});

export const customerCategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  isDefault: z.boolean().default(false),
  receivableAccountId: z.string().min(1, "Receivable account is required"),
  liabilityAccountId: z.string().min(1, "Liability account is required"),
});

export const chartOfAccountSchema = z.object({
  code: z.string().min(2).max(16),
  name: z.string().min(2),
  accountType: accountTypeSchema,
  isActive: z.boolean().default(true),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
export type FinancialYearInput = z.infer<typeof financialYearSchema>;
/** @deprecated Use FinancialYearInput */
export type FinancialYearSettingsInput = FinancialYearInput;
export type CurrencyInput = z.infer<typeof currencySchema>;
export type ExpenseCategoryInput = z.infer<typeof expenseCategorySchema>;
export type InterestSettingsInput = z.infer<typeof interestSettingsSchema>;
/** @deprecated Use InterestSettingsInput */
export type LoanSettingsInput = InterestSettingsInput;
export type LoanTypeInput = z.infer<typeof loanTypeSchema>;
export type PenaltySettingsInput = z.infer<typeof penaltySettingsSchema>;
export type ClassificationRuleInput = z.infer<typeof classificationRuleSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
export type CustomerCategoryInput = z.infer<typeof customerCategorySchema>;
export type ChartOfAccountInput = z.infer<typeof chartOfAccountSchema>;
