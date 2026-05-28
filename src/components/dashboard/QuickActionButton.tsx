import { Chip } from "@heroui/react";
import type { ReactNode } from "react";
import { fiscal } from "../../lib/fiscal";

type QuickActionButtonProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function QuickActionButton({ title, description, icon }: QuickActionButtonProps) {
  return (
    <button
      type="button"
      disabled
      className="flex w-full items-start gap-3 border border-border-fiscal bg-bg-surface px-4 py-3.5 text-left opacity-90"
    >
      <span className="mt-0.5 text-brand-accent">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={`${fiscal.link} text-sm text-brand-primary`}>{title}</span>
        <span className={`${fiscal.label} text-xs`}>{description}</span>
      </span>
      <Chip
        size="sm"
        variant="soft"
        className={`${fiscal.badge} shrink-0 border border-border-fiscal bg-fiscal-white text-brand-primary`}
      >
        Soon
      </Chip>
    </button>
  );
}
