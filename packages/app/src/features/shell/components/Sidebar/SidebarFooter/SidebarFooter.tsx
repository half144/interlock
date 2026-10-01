import { ChevronRight, Settings2, Workflow } from "lucide-react";
import { useStore } from "@/stores/app-store";
import { Fold } from "@/features/shell/components/Fold/Fold";
import { NavItem } from "@/features/shell/components/NavItem/NavItem";

/** Open, the tracker nudge; folded to the rail, a settings shortcut in the same spot. */
export function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const go = useStore((s) => s.go);

  return (
    <div className="grid px-2 pb-2">
      <Fold show={!collapsed} className="w-[248px] [grid-area:1/1]">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl bg-raised px-3 py-2.5 text-left shadow-card transition-colors hover:bg-raised-2"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-inset">
            <Workflow className="size-4 text-ink-2" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-serif text-[13.5px] text-ink">Connect your tracker</span>
            <span className="block truncate text-[12px] text-ink-3">
              Labelled issues become tasks
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-ink-3" />
        </button>
      </Fold>
      <Fold show={collapsed} className="self-end [grid-area:1/1]">
        <NavItem
          collapsed
          active={false}
          onClick={() => go({ kind: "settings", projectId: "checkout" })}
          icon={<Settings2 />}
          label="Settings"
        />
      </Fold>
    </div>
  );
}
