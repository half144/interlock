import { Code2, MoreHorizontal, SquareTerminal, Trash2 } from "lucide-react";
import { useStore } from "@/stores/app-store";
import { MenuItem } from "@/components/ui/MenuItem/MenuItem";
import { Popover } from "@/components/ui/Popover/Popover";

/** The task's less frequent actions behind "More": open it elsewhere, or throw the work away. */
export function TaskMenu({ agentId }: { agentId: string }) {
  const openPanel = useStore((s) => s.openPanel);
  const discard = useStore((s) => s.discard);

  return (
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
          <MenuItem onSelect={close}>
            <Code2 />
            Open in editor
          </MenuItem>
          <MenuItem onSelect={() => (openPanel("terminal"), close())}>
            <SquareTerminal />
            Open terminal
          </MenuItem>
          <div role="separator" className="my-1 h-px bg-seam" />
          <button
            type="button"
            role="menuitem"
            onClick={() => (discard(agentId), close())}
            className="flex h-8 w-full items-center gap-2 rounded-[5px] px-2 text-left text-[13px] text-red hover:bg-red/10"
          >
            <Trash2 className="size-3.5" />
            Discard task
          </button>
        </>
      )}
    </Popover>
  );
}
