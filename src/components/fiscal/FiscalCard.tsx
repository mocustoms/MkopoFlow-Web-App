import { cn } from "@heroui/react";
import type { ReactNode } from "react";

type FiscalCardProps = {
  children: ReactNode;
  className?: string;
};

/** Card shell: 1px border, no shadow — Fiscal Authority */
export function FiscalCard({ children, className }: FiscalCardProps) {
  return (
    <div
      className={cn(
        "fiscal-panel rounded-[var(--radius)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

type FiscalCardSectionProps = {
  children: ReactNode;
  className?: string;
};

export function FiscalCardHeader({ children, className }: FiscalCardSectionProps) {
  return (
    <div
      className={cn(
        "border-b border-border-fiscal px-4 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FiscalCardTitle({ children, className }: FiscalCardSectionProps) {
  return <h3 className={cn("fiscal-heading text-base", className)}>{children}</h3>;
}

export function FiscalCardDescription({ children, className }: FiscalCardSectionProps) {
  return (
    <p className={cn("fiscal-label mt-1 text-sm", className)}>{children}</p>
  );
}

export function FiscalCardBody({ children, className }: FiscalCardSectionProps) {
  return <div className={cn("px-4 py-4", className)}>{children}</div>;
}

export function FiscalCardFooter({ children, className }: FiscalCardSectionProps) {
  return (
    <div
      className={cn(
        "border-t border-border-fiscal px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
