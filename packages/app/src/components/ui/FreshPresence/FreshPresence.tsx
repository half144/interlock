import type { ReactNode } from "react";
import { PresenceContext } from "motion/react";

/**
 * An `AnimatePresence initial={false}` blocks the entrance of every motion component below it for as long as it
 * lives, however late they mount. This gives its children a clean presence, so what arrives later still animates.
 */
export function FreshPresence({ children }: { children: ReactNode }) {
  return <PresenceContext.Provider value={null}>{children}</PresenceContext.Provider>;
}
