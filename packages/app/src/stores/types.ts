import type { StateCreator } from "zustand";
import type { AgentKind, Effort } from "@/types";
import type { UiSlice } from "./slices/ui";
import type { TaskSlice } from "./slices/tasks";
import type { AutomationSlice } from "./slices/automations";
import type { SubagentSlice } from "./slices/subagents";
import type { EditorSlice } from "./slices/editor";
import type { SimulationSlice } from "./simulation";

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
  model: string;
  mode: "plan" | "auto";
  effort: Effort;
}

export type AppState = UiSlice &
  TaskSlice &
  AutomationSlice &
  SubagentSlice &
  EditorSlice &
  SimulationSlice;

/** Every slice sees the whole store, so an action can update state owned by another slice. */
export type SliceCreator<Slice> = StateCreator<AppState, [], [], Slice>;
