import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { WindowFrame } from "@/components/layout/WindowFrame/WindowFrame";
import { FirstRun } from "@/features/onboarding/components/FirstRun/FirstRun";
import { CommandPalette } from "@/features/palette/components/CommandPalette/CommandPalette";
import { Sidebar } from "@/features/shell/components/Sidebar/Sidebar";
import { Toaster } from "@/features/shell/components/Toaster/Toaster";
import { useRail, useSidebarSpring, useSidebarWidth } from "@/hooks/useRail";
import { DaemonNotice } from "./DaemonNotice";
import { useDaemon } from "./useDaemon";
import { useHotkeys } from "./useHotkeys";
import { usePlatformSync } from "./usePlatformSync";
import { useRouteSync } from "./useRouteSync";
import { ViewOutlet } from "./ViewOutlet";

/** The app shell: the sidebar, the current view, and the overlays that float above both. */
export function App() {
  const rail = useRail();
  const sidebarWidth = useSidebarWidth();
  const spring = useSidebarSpring();
  const reduce = useReducedMotion();
  useDaemon();
  useRouteSync();
  usePlatformSync();
  useHotkeys();

  return (
    <MotionConfig reducedMotion="user">
      <WindowFrame>
        {/* Same spring and same frame as the chat column and side panel, so all three edges move as one. */}
        <motion.div
          initial={false}
          animate={{ width: sidebarWidth }}
          transition={reduce ? { duration: 0 } : spring}
          inert={sidebarWidth === 0}
          className="shrink-0 overflow-hidden"
        >
          <Sidebar collapsed={rail} />
        </motion.div>
        <main className="min-w-0 flex-1 bg-panel">
          <ViewOutlet />
        </main>
      </WindowFrame>
      <CommandPalette />
      <Toaster />
      <FirstRun />
      <DaemonNotice />
    </MotionConfig>
  );
}
