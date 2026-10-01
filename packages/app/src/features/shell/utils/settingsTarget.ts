import type { Agent, View } from "@/types";

interface Context {
  view: View;
  agents: Record<string, Agent>;
  projectFilter: string | null;
  projectIds: string[];
}

/** The project the sidebar's Settings shortcut opens: the one on screen, else the filtered one, else the first. */
export function settingsTarget({
  view,
  agents,
  projectFilter,
  projectIds,
}: Context): string | null {
  if (view.kind === "settings") return view.projectId;
  const open = view.kind === "thread" ? agents[view.threadId]?.projectId : undefined;
  return open ?? projectFilter ?? projectIds[0] ?? null;
}
