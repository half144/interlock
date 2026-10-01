import type { AuthProvider, ProviderUsage, ToolStatus } from "@/types";
import { TOOL_LABELS } from "@/lib/diagnostics";

export interface ReadyAgent {
  kind: AuthProvider;
  label: string;
  plan: string | null;
}

/** The agents installed and signed in, with the plan their usage reports once it has loaded. */
export const readyAgents = (tools: ToolStatus[], usage: ProviderUsage[]): ReadyAgent[] =>
  tools.flatMap((tool) =>
    (tool.id === "claude" || tool.id === "codex") && tool.installed && tool.loggedIn === true
      ? [
          {
            kind: tool.id,
            label: TOOL_LABELS[tool.id],
            plan: usage.find((u) => u.kind === tool.id)?.plan ?? tool.plan,
          },
        ]
      : [],
  );
