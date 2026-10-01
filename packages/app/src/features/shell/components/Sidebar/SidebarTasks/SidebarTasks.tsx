import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { X } from "lucide-react";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { useSidebarTasks } from "./useSidebarTasks";
import { TaskRow } from "./TaskRow/TaskRow";
import { SidebarIconButton } from "@/features/shell/components/SidebarIconButton/SidebarIconButton";

/** Every task, newest activity first, optionally narrowed to one project. */
export function SidebarTasks() {
  const { tasks, order, filterName, activeThreadId, clearFilter } = useSidebarTasks();

  return (
    <>
      <div className="mt-5 flex h-8 items-center justify-between pr-2 pl-4">
        <span className="placard">{filterName ? `Tasks in ${filterName}` : "All tasks"}</span>
        {clearFilter && (
          <SidebarIconButton label="Show all tasks" onClick={clearFilter}>
            <X />
          </SidebarIconButton>
        )}
      </div>
      {/* Rows re-render on every tick, so only real changes animate: a new task grows in, the rest reflow, and the selection slides. */}
      <LayoutGroup id="sidebar-tasks">
        <motion.div layoutScroll className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          <AnimatePresence initial={false}>
            {tasks.map((t) => (
              <motion.div
                key={t.id}
                layout="position"
                layoutDependency={order}
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  transition: { height: spring, opacity: fadeIn },
                }}
                exit={{ opacity: 0, height: 0, transition: { height: spring, opacity: fadeOut } }}
                transition={spring}
              >
                <TaskRow thread={t} active={activeThreadId === t.id} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </>
  );
}
