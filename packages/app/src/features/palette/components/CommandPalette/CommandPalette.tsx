import { AnimatePresence } from "motion/react";
import { PaletteDialog } from "./PaletteDialog/PaletteDialog";
import { useCommandPalette } from "./useCommandPalette";

/** Mounts the ⌘K dialog while it's open, so it animates in and out and always opens with an empty query. */
export function CommandPalette() {
  const open = useCommandPalette();
  return <AnimatePresence>{open && <PaletteDialog key="palette" />}</AnimatePresence>;
}
