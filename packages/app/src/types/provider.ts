import type { AgentKind } from "./agent";

export interface EffortOption {
  id: string;
  label: string;
  isDefault: boolean;
}

export interface ModelOption {
  id: string;
  label: string;
  isDefault: boolean;
  efforts: EffortOption[];
  defaultEffort: string | null;
}

interface ModeOption {
  id: string;
  label: string;
}

export interface ProviderEntry {
  kind: AgentKind;
  label: string;
  status: "ready" | "loading" | "error" | "unavailable";
  models: ModelOption[];
  modes: ModeOption[];
  defaultModeId: string | null;
}
