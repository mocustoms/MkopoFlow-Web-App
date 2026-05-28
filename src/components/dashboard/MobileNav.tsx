import { Button } from "@heroui/react";
import { fiscal } from "../../lib/fiscal";
import { IconClose } from "./icons";
import { SidebarNav } from "./SidebarNav";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside
        className={`${fiscal.panelSidebar} absolute inset-y-0 left-0 flex w-[min(100%,16rem)] flex-col overflow-y-auto border-r border-border-fiscal ${fiscal.fontSans}`}
      >
        <div className={`flex items-center justify-end border-b ${fiscal.sidebarBorder} px-3 py-2`}>
          <Button
            variant="ghost"
            isIconOnly
            aria-label="Close menu"
            className="text-sidebar-fg"
            onPress={onClose}
          >
            <IconClose size={20} />
          </Button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </aside>
    </div>
  );
}
