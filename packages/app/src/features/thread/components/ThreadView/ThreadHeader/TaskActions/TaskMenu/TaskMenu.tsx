import { AnimatePresence } from "motion/react";
import { MoreHorizontal, SquareTerminal, Trash2 } from "lucide-react";
import type { Agent } from "@/types";
import { MenuItem } from "@/components/ui/MenuItem/MenuItem";
import { Popover } from "@/components/ui/Popover/Popover";
import { DeleteTaskDialog } from "@/components/task/DeleteTaskDialog/DeleteTaskDialog";
import { useTaskMenu } from "./useTaskMenu";

export function TaskMenu({ agent }: { agent: Agent }) {
  const { confirming, askToDelete, cancelDelete, openTerminal } = useTaskMenu();

  return (
    <>
      <Popover
        align="end"
        trigger={({ open, toggle }) => (
          <button
            type="button"
            aria-label="More"
            aria-expanded={open}
            onClick={toggle}
            className="inline-flex size-8 items-center justify-center rounded-lg text-ink-2 transition-[background-color,scale] duration-150 ease-out-quint hover:bg-hover active:scale-95"
          >
            <MoreHorizontal className="size-4" />
          </button>
        )}
      >
        {(close) => (
          <>
            <MenuItem
              onSelect={() => {
                openTerminal();
                close();
              }}
            >
              <SquareTerminal />
              Open terminal
            </MenuItem>
            <div role="separator" className="my-1 h-px bg-seam" />
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
          </>
        )}
      </Popover>
      <AnimatePresence>
        {confirming && <DeleteTaskDialog agentId={agent.id} onClose={cancelDelete} />}
      </AnimatePresence>
    </>
  );
}
