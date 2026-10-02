import type { StateCreator } from "zustand";
import type { AgentKind, Effort } from "@/types";
import type { AccountsSlice } from "./slices/accounts";
import type { AutomationSlice } from "./slices/automations";
import type { DaemonSlice } from "./slices/daemon";
import type { DiffSlice } from "./slices/diffs";
import type { EditorSlice } from "./slices/editor";
import type { ProjectSlice } from "./slices/projects";
import type { ProjectSettingsSlice } from "./slices/projectSettings";
import type { ProviderSlice } from "./slices/providers";
import type { QueueSlice } from "./slices/queue";
import type { ReviewSlice } from "./slices/review";
import type { ShipSlice } from "./slices/ship";
import type { SubagentSlice } from "./slices/subagents";
import type { TaskSlice } from "./slices/tasks";
import type { UiSlice } from "./slices/ui";
import type { UsageSlice } from "./slices/usage";

export interface Toast {
  id: number;
  agentId: string;
  subagentId?: string;
  text: string;
}

export interface NewTask {
  projectId: string;
  prompt: string;
  base: string;
  kind: AgentKind;
  /** The provider's model id, from the catalog. */
  model: string;
  mode: "plan" | "auto";
  effort: Effort | null;
  files: File[];
}

export type AppState = UiSlice &
  DaemonSlice &
  ProjectSlice &
  ProjectSettingsSlice &
  TaskSlice &
  QueueSlice &
  SubagentSlice &
  ProviderSlice &
  UsageSlice &
  DiffSlice &
  EditorSlice &
  ReviewSlice &
  ShipSlice &
  AutomationSlice &
  AccountsSlice;

/** Every slice sees the whole store, so an action can update state owned by another slice. */
export type SliceCreator<Slice> = StateCreator<AppState, [], [], Slice>;
