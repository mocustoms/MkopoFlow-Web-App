import {
  Button,
  cn,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseTrigger,
  ModalContainer,
  ModalDialog,
  ModalFooter,
  ModalHeader,
  ModalHeading,
  useOverlayState,
} from "@heroui/react";
import type { ModalVariants } from "@heroui/styles";
import type { ReactNode } from "react";
import { useTranslation } from "../../context/LanguageContext";

/** Shared modal widths for add/edit forms across settings, customers, and financing. */
export type SettingsFormModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

type SettingsFormModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  isPending?: boolean;
  submitLabel?: string;
  readOnly?: boolean;
  /** Default `xl` for all add/edit forms. Use `2xl` only for very wide content (e.g. role permissions). */
  size?: SettingsFormModalSize;
  className?: string;
  bodyClassName?: string;
};

const EXTENDED_WIDTH_CLASS: Partial<Record<SettingsFormModalSize, string>> = {
  xl: "!max-w-3xl w-full",
  "2xl": "!max-w-6xl w-full",
};

function toHeroUISize(size: SettingsFormModalSize): ModalVariants["size"] {
  if (size === "xl" || size === "2xl") return "lg";
  return size;
}

export function SettingsFormModal({
  isOpen,
  onOpenChange,
  title,
  children,
  onSubmit,
  isPending,
  submitLabel,
  readOnly,
  size = "xl",
  className,
  bodyClassName,
}: SettingsFormModalProps) {
  const { t } = useTranslation();
  const state = useOverlayState({ isOpen, onOpenChange });
  const widthClass = EXTENDED_WIDTH_CLASS[size];

  return (
    <Modal state={state}>
      <ModalBackdrop isDismissable>
        <ModalContainer size={toHeroUISize(size)} scroll="inside" placement="center">
          <ModalDialog className={cn(widthClass, className)}>
            <ModalHeader className="flex items-center justify-between gap-2">
              <ModalHeading>{title}</ModalHeading>
              <ModalCloseTrigger />
            </ModalHeader>
            <ModalBody className={cn("min-w-0 w-full", bodyClassName)}>{children}</ModalBody>
            {!readOnly && onSubmit && (
              <ModalFooter className="flex justify-end gap-2">
                <Button variant="outline" onPress={() => state.close()}>
                  {t("common.cancel")}
                </Button>
                <Button isDisabled={isPending} onPress={onSubmit}>
                  {isPending ? t("common.saving") : (submitLabel ?? t("common.save"))}
                </Button>
              </ModalFooter>
            )}
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal>
  );
}
