import { AnimatePresence } from "motion/react";
import { useStore } from "@/stores/app-store";
import { PaletteDialog } from "./PaletteDialog/PaletteDialog";

/** Mounts the ⌘K dialog while it's open, so it animates in and out and always opens with an empty query. */
export function CommandPalette() {
  const open = useStore((s) => s.paletteOpen);
  return <AnimatePresence>{open && <PaletteDialog key="palette" />}</AnimatePresence>;
}
