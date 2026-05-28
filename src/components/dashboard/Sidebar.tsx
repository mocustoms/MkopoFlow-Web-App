import { fiscal } from "../../lib/fiscal";
import { SidebarNav } from "./SidebarNav";

/** Desktop sidebar — hidden below `lg` (mobile uses drawer). */
export function Sidebar() {
  return (
    <aside
      className={`${fiscal.panelSidebar} hidden h-full w-64 shrink-0 flex-col overflow-y-auto lg:flex ${fiscal.fontSans}`}
    >
      <SidebarNav />
    </aside>
  );
}
