import { Table } from "@heroui/react";
import type { ReactNode } from "react";
import { fiscal } from "../../lib/fiscal";

export type SettingsTableColumn<T> = {
  key: string;
  header: ReactNode;
  align?: "start" | "end";
  isRowHeader?: boolean;
  cellClassName?: string | ((row: T) => string | undefined);
  render: (row: T) => ReactNode;
};

type SettingsDataTableProps<T extends { id: string }> = {
  ariaLabel: string;
  columns: SettingsTableColumn<T>[];
  items: T[];
};

function cellClass<T>(column: SettingsTableColumn<T>, row: T, align?: "start" | "end") {
  const base =
    typeof column.cellClassName === "function"
      ? column.cellClassName(row)
      : column.cellClassName;
  const alignClass = align === "end" ? "text-right" : undefined;
  return [base, alignClass].filter(Boolean).join(" ") || undefined;
}

export function SettingsDataTable<T extends { id: string }>({
  ariaLabel,
  columns,
  items,
}: SettingsDataTableProps<T>) {
  return (
    <Table aria-label={ariaLabel} variant="secondary" className="w-full min-w-0">
      <Table.ScrollContainer>
        <Table.Content className={fiscal.table}>
          <Table.Header>
            {columns.map((column) => (
              <Table.Column
                key={column.key}
                id={column.key}
                isRowHeader={column.isRowHeader}
                className={column.align === "end" ? "text-right" : undefined}
              >
                {column.header}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body items={items}>
            {(item) => (
              <Table.Row id={item.id}>
                {columns.map((column) => (
                  <Table.Cell
                    key={column.key}
                    className={cellClass(column, item, column.align)}
                  >
                    {column.render(item)}
                  </Table.Cell>
                ))}
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
