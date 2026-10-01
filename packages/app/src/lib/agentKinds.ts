import type { AgentKind } from "@/types";

/** The agent CLIs Interlock can run, with the models each one offers. */
export const agentKinds: Record<AgentKind, { label: string; models: [string, ...string[]] }> = {
  claude: { label: "Claude Code", models: ["Opus 5.5", "Sonnet 5.5", "Haiku 4.5"] },
  codex: { label: "Codex", models: ["GPT-5.2 Codex", "GPT-5.2"] },
  gemini: { label: "Gemini CLI", models: ["Gemini 3 Pro", "Gemini 3 Flash"] },
};

export const agentKindList = Object.keys(agentKinds) as AgentKind[];

/** Each agent CLI as a picker option, labelled by name. */
export const agentKindOptions = agentKindList.map((value) => ({
  value,
  label: agentKinds[value].label,
}));

/** The model a new task starts on: each CLI's flagship, listed first. */
export const defaultModel = (kind: AgentKind) => agentKinds[kind].models[0];

export const agentLabel = (agent: { kind: AgentKind }) => agentKinds[agent.kind].label;
