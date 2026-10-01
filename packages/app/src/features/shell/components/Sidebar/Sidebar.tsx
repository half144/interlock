import { BookOpen, Search, SquarePen, Workflow } from "lucide-react";
import { useStore } from "@/stores/app-store";
import { Fold } from "../Fold/Fold";
import { NavItem } from "../NavItem/NavItem";
import { SidebarFooter } from "./SidebarFooter/SidebarFooter";
import { SidebarHeader } from "./SidebarHeader/SidebarHeader";
import { SidebarProjects } from "./SidebarProjects/SidebarProjects";
import { SidebarTasks } from "./SidebarTasks/SidebarTasks";

/**
 * One sidebar that folds to an icon rail instead of swapping for a different one. Icons sit on the same
 * 26px centre line in both states, so as the width closes they stay put and only the words and lists fade.
 */
export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const view = useStore((s) => s.view);
  const go = useStore((s) => s.go);
  const newTask = useStore((s) => s.newTask);
  const setPalette = useStore((s) => s.setPalette);

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden bg-ground">
      <SidebarHeader collapsed={collapsed} />

      <nav className="flex flex-col gap-0.5 px-2">
        <NavItem
          collapsed={collapsed}
          active={view.kind === "yard"}
          onClick={() => newTask()}
          icon={<SquarePen />}
          label="New task"
        />
        <NavItem
          collapsed={collapsed}
          active={view.kind === "automations"}
          onClick={() => go({ kind: "automations" })}
          icon={<Workflow />}
          label="Automations"
        />
        <NavItem
          collapsed={collapsed}
          active={false}
          onClick={() => setPalette(true)}
          icon={<Search />}
          label="Search"
        />
        <NavItem
          collapsed={collapsed}
          active={false}
          onClick={() => setPalette(true)}
          icon={<BookOpen />}
          label="Library"
        />
      </nav>

      {/* Laid out at full width even while the column closes, so nothing re-wraps as it fades. */}
      <Fold show={!collapsed} className="flex min-h-0 w-[264px] flex-1 flex-col">
        <SidebarProjects />
        <SidebarTasks />
      </Fold>

      <SidebarFooter collapsed={collapsed} />
    </aside>
  );
}
