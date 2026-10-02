import { Settings2 } from "lucide-react";
import { NavItem } from "@/features/shell/components/NavItem/NavItem";
import { useSidebarFooter } from "./useSidebarFooter";

export function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { active, openSettings } = useSidebarFooter();

  return (
    <div className="px-2 pb-2">
      <NavItem
        collapsed={collapsed}
        active={active}
        onClick={openSettings}
        icon={<Settings2 />}
        label="Settings"
        keys={["⌘", ","]}
      />
    </div>
  );
}
