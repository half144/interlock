import type { SessionOutboundMessage } from "@interlock/protocol/messages";
import { kindLabel } from "@/lib/agentKinds";
import type { AgentKind, ModelOption, ProviderEntry } from "@/types";

export type ProviderSnapshotEntry = Extract<
  SessionOutboundMessage,
  { type: "providers_snapshot_update" }
>["payload"]["entries"][number];

type AgentModelDefinition = NonNullable<ProviderSnapshotEntry["models"]>[number];

export function kindOf(provider: string): AgentKind | null {
  return provider === "claude" || provider === "codex" || provider === "mock" ? provider : null;
}

function toModel(model: AgentModelDefinition): ModelOption {
  return {
    id: model.id,
    label: model.label,
    isDefault: model.isDefault === true,
    efforts: (model.thinkingOptions ?? []).map((option) => ({
      id: option.id,
      label: option.label,
      isDefault: option.isDefault === true || option.id === model.defaultThinkingOptionId,
    })),
    defaultEffort: model.defaultThinkingOptionId ?? null,
  };
}

export function toProviderEntries(entries: ProviderSnapshotEntry[]): ProviderEntry[] {
  return entries.flatMap((entry) => {
    const kind = kindOf(entry.provider);
    if (!kind || !entry.enabled) return [];
    return [
      {
        kind,
        label: entry.label ?? kindLabel(kind),
        status: entry.status,
        models: (entry.models ?? []).filter((m) => m.isSelectable !== false).map(toModel),
        modes: (entry.modes ?? []).map(({ id, label }) => ({ id, label })),
        defaultModeId: entry.defaultModeId ?? null,
      },
    ];
  });
}
