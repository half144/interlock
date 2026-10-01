import { create } from "zustand";
import { createSimulationSlice } from "./simulation";
import { createAutomationSlice } from "./slices/automations";
import { createEditorSlice } from "./slices/editor";
import { createSubagentSlice } from "./slices/subagents";
import { createTaskSlice } from "./slices/tasks";
import { createUiSlice } from "./slices/ui";
import type { AppState } from "./types";

export type { Toast } from "./types";

export const useStore = create<AppState>()((...a) => ({
  ...createUiSlice(...a),
  ...createTaskSlice(...a),
  ...createAutomationSlice(...a),
  ...createSubagentSlice(...a),
  ...createEditorSlice(...a),
  ...createSimulationSlice(...a),
}));
