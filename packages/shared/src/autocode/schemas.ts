import { z } from "zod";
import { AUTOCODE_INCLUDE_DATES, AUTOCODE_MODULES } from "./format.js";

const codePartSchema = z
  .string()
  .min(1, "Required")
  .max(16, "Too long")
  .regex(/^[A-Za-z0-9]+$/, "Use letters and numbers only");

export const autocodeModuleSchema = z.enum(AUTOCODE_MODULES);

export const autocodeIncludeDateSchema = z.enum(AUTOCODE_INCLUDE_DATES);

export const autocodeRuleSchema = z.object({
  prefix: codePartSchema,
  suffix: z
    .union([codePartSchema, z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v == null ? null : v)),
  separator: z.string().max(2).default(""),
  sequencePadding: z.coerce.number().int().min(1).max(10),
  nextSequence: z.coerce.number().int().min(1).optional(),
  includeDate: autocodeIncludeDateSchema.default("NONE"),
  isActive: z.boolean().default(true),
});

export type AutocodeRuleInput = z.infer<typeof autocodeRuleSchema>;
