import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { MIN_APP_WIDTH } from "@/lib/layout";
import { dock } from "@/lib/motion";
import { CommandPalette } from "@/features/palette/components/CommandPalette/CommandPalette";
import { Sidebar } from "@/features/shell/components/Sidebar/Sidebar";
import { Toaster } from "@/features/shell/components/Toaster/Toaster";
import { useRail, useSidebarWidth } from "@/hooks/useRail";
import { useHotkeys } from "./useHotkeys";
import { useSimulationClock } from "./useSimulationClock";
import { ViewOutlet } from "./ViewOutlet";

/** The app shell: the sidebar, the current view, and the overlays that float above both. */
export function App() {
  const rail = useRail();
  const sidebarWidth = useSidebarWidth();
  const reduce = useReducedMotion();
  useHotkeys();
  useSimulationClock();

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-full" style={{ minWidth: MIN_APP_WIDTH }}>
        {/* Same spring and same frame as the chat column and side panel, so all three edges move as one. */}
        <motion.div
          initial={false}
          animate={{ width: sidebarWidth }}
          transition={reduce ? { duration: 0 } : dock}
          inert={sidebarWidth === 0}
          className="shrink-0 overflow-hidden"
        >
          <Sidebar collapsed={rail} />
        </motion.div>
        <main className="min-w-0 flex-1 bg-panel">
          <ViewOutlet />
        </main>
        <CommandPalette />
        <Toaster />
      </div>
    </MotionConfig>
  );
}
