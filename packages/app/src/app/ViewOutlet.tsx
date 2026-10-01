import { motion } from "motion/react";
import { useStore } from "@/stores/app-store";
import { fadeIn } from "@/lib/motion";
import type { View } from "@/types";
import { AutomationsView } from "@/features/automations/components/AutomationsView/AutomationsView";
import { Home } from "@/features/home/components/Home/Home";
import { SettingsView } from "@/features/settings/components/SettingsView/SettingsView";
import { ThreadView } from "@/features/thread/components/ThreadView/ThreadView";

// Threads share one key: switching chats keeps the frame still and only the conversation crossfades (see ThreadView).
const viewKey = (view: View) =>
  view.kind === "settings" ? `settings:${view.projectId}` : view.kind;

/** The main area's current view. No exit and no movement: the old view leaves at once and the new one fades in where it will stay. */
export function ViewOutlet() {
  const view = useStore((s) => s.view);

  return (
    <motion.div
      key={viewKey(view)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={fadeIn}
      className="h-full"
    >
      {view.kind === "yard" && <Home />}
      {view.kind === "thread" && <ThreadView threadId={view.threadId} />}
      {view.kind === "automations" && <AutomationsView />}
      {view.kind === "settings" && <SettingsView projectId={view.projectId} />}
    </motion.div>
  );
}
