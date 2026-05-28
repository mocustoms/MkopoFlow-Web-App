import { Card, Separator } from "@heroui/react";
import type { ReactNode } from "react";
import { fiscal } from "../../lib/fiscal";

type MetricRow = {
  label: string;
  value: string;
  highlight?: "success" | "alert" | "default";
};

type MetricCardProps = {
  title: string;
  rows: MetricRow[];
  footer?: ReactNode;
};

const valueClasses = {
  success: fiscal.figureSuccess,
  alert: fiscal.figureAlert,
  default: fiscal.figure,
};

export function MetricCard({ title, rows, footer }: MetricCardProps) {
  return (
    <Card variant="default" className="h-full border border-border-fiscal shadow-none">
      <Card.Header className="border-b border-border-fiscal">
        <Card.Title className="fiscal-heading text-base">{title}</Card.Title>
      </Card.Header>
      <Card.Content className="flex flex-col gap-0 p-0">
        {rows.map((row, index) => (
          <div key={row.label}>
            {index > 0 && <Separator className="bg-border-fiscal" />}
            <div className="flex flex-col gap-1 px-4 py-3.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <span className="fiscal-label">{row.label}</span>
              <span className={valueClasses[row.highlight ?? "default"]}>{row.value}</span>
            </div>
          </div>
        ))}
        {footer && (
          <>
            <Separator className="bg-border-fiscal" />
            <div className="px-4 py-3">{footer}</div>
          </>
        )}
      </Card.Content>
    </Card>
  );
}
