import { z } from "zod";
import type { AgentMode } from "./agent-types.js";

export type AgentModeColorTier = "safe" | "moderate" | "dangerous" | "planning" | `#${string}`;
// Open string by design: the client looks icons up in a registry and falls back
// to a default for unknown values. Daemon downgrades unknown icons for clients
// that pre-date the open-string contract (see CLIENT_CAPS.customModeIcons).
export type AgentModeIcon = string;

export interface AgentModeVisuals {
  icon: AgentModeIcon;
  colorTier: AgentModeColorTier;
}

export type AgentProviderModeDefinition = Omit<AgentMode, "icon" | "colorTier"> &
  AgentModeVisuals & {
    // Marks the provider's most-permissioned no-prompt mode. Selecting it means tools run without approval; the runtime mechanism is provider-specific.
    isUnattended?: boolean;
  };

export interface AgentProviderDefinition {
  id: string;
  label: string;
  description: string;
  enabledByDefault?: boolean;
  defaultModeId: string | null;
  modes: AgentProviderModeDefinition[];
}

const CLAUDE_MODES: AgentProviderModeDefinition[] = [
  {
    id: "plan",
    label: "Plan Mode",
    description: "Analyze the codebase without executing tools or edits",
    icon: "ShieldEllipsis",
    colorTier: "planning",
  },
  {
    id: "default",
    label: "Always Ask",
    description: "Prompts for permission the first time a tool is used",
    icon: "Shield",
    colorTier: "safe",
  },
  {
    id: "acceptEdits",
    label: "Accept File Edits",
    description: "Automatically approves edit-focused tools without prompting",
    icon: "ShieldPlus",
    colorTier: "moderate",
  },
  {
    id: "auto",
    label: "Auto mode",
    description: "Uses a model classifier to review permission prompts automatically",
    icon: "ShieldCheck",
    colorTier: "moderate",
  },
  {
    id: "bypassPermissions",
    label: "Bypass",
    description: "Skip all permission prompts (use with caution)",
    icon: "ShieldOff",
    colorTier: "dangerous",
    isUnattended: true,
  },
];

const CODEX_MODES: AgentProviderModeDefinition[] = [
  {
    id: "auto",
    label: "Default Permissions",
    description: "Edit files and run commands with Codex's default approval flow.",
    icon: "Shield",
    colorTier: "moderate",
  },
  {
    id: "auto-review",
    label: "Auto-review",
    description:
      "Same workspace-write permissions as Default, but eligible `on-request` approvals are routed through the auto-reviewer subagent.",
    icon: "ShieldCheck",
    colorTier: "moderate",
  },
  {
    id: "full-access",
    label: "Full Access",
    description: "Edit files, run commands, and access the network without additional prompts.",
    icon: "ShieldOff",
    colorTier: "dangerous",
    isUnattended: true,
  },
];

const MOCK_LOAD_TEST_MODES: AgentProviderModeDefinition[] = [
  {
    id: "load-test",
    label: "Load Test",
    description: "Streams repeated markdown, reasoning, and tool calls for app stress testing",
    icon: "ShieldOff",
    colorTier: "dangerous",
  },
  {
    id: "approval-test",
    label: "Approval Test",
    description: "Alternate development-only permission mode for preference tests",
    icon: "ShieldCheck",
    colorTier: "safe",
  },
];

const MOCK_SLOW_MODES: AgentProviderModeDefinition[] = [
  {
    id: "default",
    label: "Default",
    description: "Dev-only mode for the mock slow provider",
    icon: "ShieldOff",
    colorTier: "dangerous",
  },
];

export const AGENT_PROVIDER_DEFINITIONS: AgentProviderDefinition[] = [
  {
    id: "claude",
    label: "Claude",
    description: "Anthropic's multi-tool assistant with MCP support, streaming, and deep reasoning",
    defaultModeId: "auto",
    modes: CLAUDE_MODES,
  },
  {
    id: "codex",
    label: "Codex",
    description: "OpenAI's Codex workspace agent with sandbox controls and optional network access",
    defaultModeId: "auto-review",
    modes: CODEX_MODES,
  },
];

export const DEV_AGENT_PROVIDER_DEFINITIONS: AgentProviderDefinition[] = [
  {
    id: "mock",
    label: "Mock Load Test",
    description:
      "Development-only provider that emits synthetic agent traffic for performance tests",
    defaultModeId: "load-test",
    modes: MOCK_LOAD_TEST_MODES,
  },
  {
    id: "mock-slow",
    label: "Mock Slow Provider",
    description: "Dev-only: hangs during model discovery to test loading and timeout UI",
    defaultModeId: "default",
    modes: MOCK_SLOW_MODES,
  },
];

export function getAgentProviderDefinition(
  provider: string,
  definitions: AgentProviderDefinition[] = [
    ...AGENT_PROVIDER_DEFINITIONS,
    ...DEV_AGENT_PROVIDER_DEFINITIONS,
  ],
): AgentProviderDefinition {
  const definition = definitions.find((entry) => entry.id === provider);
  if (!definition) {
    throw new Error(`Unknown agent provider: ${provider}`);
  }
  return definition;
}

export const BUILTIN_PROVIDER_IDS = AGENT_PROVIDER_DEFINITIONS.map((d) => d.id);

export const AgentProviderSchema = z.string();
