import { AnimatePresence } from "motion/react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { DeleteTaskDialog } from "@/components/task/DeleteTaskDialog/DeleteTaskDialog";
import { MenuItem } from "@/components/ui/MenuItem/MenuItem";
import { Popover } from "@/components/ui/Popover/Popover";
import { cn } from "@/lib/utils";
import { useTaskRowMenu } from "./useTaskRowMenu";

/** Shows on row hover or focus, and stays while its menu is open. */
export function TaskRowMenu({ agentId }: { agentId: string }) {
  const { confirming, side, placeMenu, askToDelete, cancelDelete } = useTaskRowMenu();

  return (
    <>
      <div className="absolute top-1/2 right-1 -translate-y-1/2">
        <Popover
          align="end"
          side={side}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              aria-label="Task actions"
              aria-expanded={open}
              onClick={(event) => {
                placeMenu(event);
                toggle();
              }}
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-selected hover:text-ink focus-visible:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 [&_svg]:size-4",
                open ? "bg-selected opacity-100" : "opacity-0",
              )}
            >
              <MoreHorizontal />
            </button>
          )}
        >
          {(close) => (
            <MenuItem
              danger
              onSelect={() => {
                askToDelete();
                close();
              }}
            >
              <Trash2 />
              Delete task
            </MenuItem>
          )}
        </Popover>
      </div>
      <AnimatePresence>
        {confirming && <DeleteTaskDialog agentId={agentId} onClose={cancelDelete} />}
      </AnimatePresence>
    </>
  );
}
