import { Chip, cn } from "@heroui/react";
import type { ReactNode } from "react";
import { fiscal } from "../../lib/fiscal";

type FiscalChipVariant = "success" | "alert" | "accent" | "neutral";

const variantClasses: Record<FiscalChipVariant, string> = {
  success: "border-border-fiscal bg-fiscal-white text-status-success",
  alert: "border-border-fiscal bg-fiscal-white text-status-alert",
  accent: "border-border-fiscal bg-fiscal-white text-brand-accent",
  neutral: "border-border-fiscal bg-bg-surface text-brand-primary",
};

type FiscalChipProps = {
  variant: FiscalChipVariant;
  children: ReactNode;
};

export function FiscalChip({ variant, children }: FiscalChipProps) {
  return (
    <Chip
      size="sm"
      variant="soft"
      className={cn("border shadow-none", fiscal.badge, variantClasses[variant])}
    >
      {children}
    </Chip>
  );
}
