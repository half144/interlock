import { AnimatePresence } from "motion/react";
import { MoreHorizontal, SquareTerminal, Trash2 } from "lucide-react";
import type { Agent } from "@/types";
import { MenuItem } from "@/components/ui/MenuItem/MenuItem";
import { Popover } from "@/components/ui/Popover/Popover";
import { DiscardDialog } from "./DiscardDialog/DiscardDialog";
import { useTaskMenu } from "./useTaskMenu";

export function TaskMenu({ agent }: { agent: Agent }) {
  const { confirming, askToDiscard, cancelDiscard, openTerminal } = useTaskMenu();

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
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                askToDiscard();
                close();
              }}
              className="flex h-8 w-full items-center gap-2 rounded-[5px] px-2 text-left text-[13px] text-red hover:bg-red/10"
            >
              <Trash2 className="size-3.5" />
              Discard task
            </button>
          </>
        )}
      </Popover>
      <AnimatePresence>
        {confirming && <DiscardDialog agent={agent} onClose={cancelDiscard} />}
      </AnimatePresence>
    </>
  );
}
