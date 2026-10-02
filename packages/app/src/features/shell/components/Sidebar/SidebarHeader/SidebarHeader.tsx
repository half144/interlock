import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/LogoMark/LogoMark";
import { Fold } from "@/features/shell/components/Fold/Fold";
import { SidebarIconButton } from "@/features/shell/components/SidebarIconButton/SidebarIconButton";
import { useSidebarHeader } from "./useSidebarHeader";
import { VersionBadge } from "./VersionBadge/VersionBadge";

/** The mark, the wordmark and the collapse control. Folded, the mark itself expands the sidebar on hover. */
export function SidebarHeader({ collapsed }: { collapsed: boolean }) {
  const { expand, collapse } = useSidebarHeader();

  return (
    <div
      data-tauri-drag-region
      className="flex h-[52px] shrink-0 items-center pl-3.5 mac:pl-lights"
    >
      <button
        type="button"
        disabled={!collapsed}
        onClick={expand}
        aria-label={collapsed ? "Expand sidebar" : undefined}
        title={collapsed ? "Expand sidebar" : undefined}
        className="group/logo relative inline-flex size-6 shrink-0 items-center justify-center rounded-md text-ink mac:hidden"
      >
        <span className={cn("transition-opacity", collapsed && "group-hover/logo:opacity-0")}>
          <LogoMark />
        </span>
        <PanelLeft className="absolute size-4 text-ink-2 opacity-0 transition-opacity group-enabled/logo:group-hover/logo:opacity-100" />
      </button>
      <Fold
        show={!collapsed}
        className="flex w-[218px] shrink-0 items-center justify-between pr-2 pl-1.5 mac:w-[calc(264px-var(--spacing-lights))] mac:pl-0"
      >
        <span className="flex items-center gap-2">
          <span className="font-serif text-[17px] leading-none tracking-[-0.01em] text-ink">
            interlock
          </span>
          <VersionBadge />
        </span>
        <SidebarIconButton label="Collapse sidebar" onClick={collapse}>
          <PanelLeft />
        </SidebarIconButton>
      </Fold>
    </div>
  );
}
