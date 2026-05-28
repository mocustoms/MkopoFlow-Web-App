import { cn, Input, Label, TextArea, TextField } from "@heroui/react";
import type { ComponentProps, ReactNode } from "react";
import { fiscal } from "../../lib/fiscal";

const fieldClass = "flex w-full flex-col gap-1.5";

type SettingsTextFieldProps = {
  label: ReactNode;
  description?: ReactNode;
  id?: string;
  className?: string;
} & Omit<ComponentProps<typeof Input>, "children">;

export function SettingsTextField({
  label,
  description,
  id,
  className,
  ...inputProps
}: SettingsTextFieldProps) {
  return (
    <TextField id={id} name={id} className={cn(fieldClass, className)} fullWidth>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} fullWidth {...inputProps} />
      {description ? <p className={`${fiscal.label} text-xs`}>{description}</p> : null}
    </TextField>
  );
}

type SettingsTextAreaFieldProps = {
  label: ReactNode;
  description?: ReactNode;
  id?: string;
  className?: string;
} & Omit<ComponentProps<typeof TextArea>, "children">;

export function SettingsTextAreaField({
  label,
  description,
  id,
  className,
  ...textAreaProps
}: SettingsTextAreaFieldProps) {
  return (
    <TextField id={id} name={id} className={cn(fieldClass, className)} fullWidth>
      <Label htmlFor={id}>{label}</Label>
      <TextArea id={id} fullWidth {...textAreaProps} />
      {description ? <p className={`${fiscal.label} text-xs`}>{description}</p> : null}
    </TextField>
  );
}

type SettingsSelectFieldProps = {
  label: ReactNode;
  description?: ReactNode;
  id?: string;
  className?: string;
  selectClassName?: string;
  children: ReactNode;
} & Omit<ComponentProps<"select">, "children">;

export function SettingsSelectField({
  label,
  description,
  id,
  className,
  selectClassName,
  children,
  ...selectProps
}: SettingsSelectFieldProps) {
  return (
    <TextField id={id} name={id} className={cn(fieldClass, className)} fullWidth>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className={selectClassName ?? fiscal.select}
        {...selectProps}
      >
        {children}
      </select>
      {description ? <p className={`${fiscal.label} text-xs`}>{description}</p> : null}
    </TextField>
  );
}

type SettingsMultiSelectFieldProps = {
  label: ReactNode;
  description?: ReactNode;
  id?: string;
  className?: string;
  selectClassName?: string;
  children: ReactNode;
  value: string[];
  onChange: (value: string[]) => void;
  size?: number;
};

export function SettingsMultiSelectField({
  label,
  description,
  id,
  className,
  selectClassName,
  children,
  value,
  onChange,
  size = 5,
}: SettingsMultiSelectFieldProps) {
  return (
    <TextField id={id} name={id} className={cn(fieldClass, className)} fullWidth>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        multiple
        size={size}
        className={selectClassName ?? fiscal.select}
        value={value}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
          onChange(selected);
        }}
      >
        {children}
      </select>
      {description ? <p className={`${fiscal.label} text-xs`}>{description}</p> : null}
    </TextField>
  );
}
