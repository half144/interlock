import { PanelLeft } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { dock } from "@/lib/motion";
import { useWindowBar } from "./useWindowBar";

/**
 * The strip across the top of a Mac window, where the title bar used to be. The window buttons float over its
 * left end and the sidebar toggle follows; everything else (a view's title and actions, the workspace tabs) is
 * moved into the slot, which spans the main area so each header sits over the column it belongs to. The slot
 * clips sideways only: a header's menu (the model picker) has to drop out of the bar over the page.
 */
export function WindowBar({ slotRef }: { slotRef: (element: HTMLElement | null) => void }) {
  const { sidebarWidth, label, toggle } = useWindowBar();
  const reduce = useReducedMotion();

  return (
    <div data-tauri-drag-region className="relative h-12 shrink-0 border-b border-seam bg-ground">
      <motion.div
        ref={slotRef}
        initial={false}
        animate={{ left: sidebarWidth }}
        transition={reduce ? { duration: 0 } : dock}
        className="absolute inset-y-0 right-0 overflow-x-clip"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-lights">
        <IconButton label={label} onClick={toggle}>
          <PanelLeft />
        </IconButton>
      </div>
    </div>
  );
}
