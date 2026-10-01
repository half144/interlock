import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import { notify } from "@/platform/desktop";
import { useStore } from "@/stores/app-store";
import { toNotice } from "../adapters/attention";

/** The task is on screen when it is the open thread and the window is the one you are looking at. */
const isOnScreen = (agentId: string) =>
  useStore.getState().selectedAgentId === agentId &&
  document.visibilityState === "visible" &&
  document.hasFocus();

/** A finished, failed or waiting task you are not looking at becomes a notification, a toast and an unseen mark. */
export function listenAttention(client: DaemonClient): () => void {
  return client.on("agent_attention_required", ({ payload }) => {
    const store = useStore.getState();
    const agent = store.agents[payload.agentId];
    if (!agent || isOnScreen(agent.id)) return;
    const notice = toNotice(agent, payload.reason);
    if (!notice) return;
    store.flagTask(agent.id, notice.body);
    notify(notice).catch((error: unknown) => console.error("Notification failed", error));
  });
}
