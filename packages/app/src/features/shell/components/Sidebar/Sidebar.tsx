import { Search, SquarePen } from "lucide-react";
import { Fold } from "../Fold/Fold";
import { NavItem } from "../NavItem/NavItem";
import { SidebarFooter } from "./SidebarFooter/SidebarFooter";
import { SidebarHeader } from "./SidebarHeader/SidebarHeader";
import { SidebarProjects } from "./SidebarProjects/SidebarProjects";
import { SidebarTasks } from "./SidebarTasks/SidebarTasks";
import { useSidebar } from "./useSidebar";

/**
 * One sidebar that folds to an icon rail instead of swapping for a different one. Icons sit on the same
 * 26px centre line in both states, so as the width closes they stay put and only the words and lists fade.
 */
export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { onHome, newTask, search } = useSidebar();

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden bg-ground">
      <SidebarHeader collapsed={collapsed} />

      <nav className="flex flex-col gap-0.5 px-2">
        <NavItem
          collapsed={collapsed}
          active={onHome}
          onClick={newTask}
          icon={<SquarePen />}
          label="New task"
          keys={["D"]}
        />
        <NavItem
          collapsed={collapsed}
          active={false}
          onClick={search}
          icon={<Search />}
          label="Search"
          keys={["⌘", "K"]}
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
