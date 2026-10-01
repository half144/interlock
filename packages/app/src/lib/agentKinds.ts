import type { AgentKind } from "@/types";

const LABELS: Record<AgentKind, string> = { claude: "Claude Code", codex: "Codex", mock: "Mock" };

export const kindLabel = (kind: AgentKind) => LABELS[kind];

export const agentLabel = (agent: { kind: AgentKind }) => LABELS[agent.kind];
