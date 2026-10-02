import { create } from "zustand";
import { createAccountsSlice } from "./slices/accounts";
import { createAutomationSlice } from "./slices/automations";
import { createDaemonSlice } from "./slices/daemon";
import { createDiffSlice } from "./slices/diffs";
import { createEditorSlice } from "./slices/editor";
import { createProjectSlice } from "./slices/projects";
import { createProjectSettingsSlice } from "./slices/projectSettings";
import { createProviderSlice } from "./slices/providers";
import { createQueueSlice } from "./slices/queue";
import { createReviewSlice } from "./slices/review";
import { createShipSlice } from "./slices/ship";
import { createSubagentSlice } from "./slices/subagents";
import { createTaskSlice } from "./slices/tasks";
import { createUiSlice } from "./slices/ui";
import { createUsageSlice } from "./slices/usage";
import type { AppState } from "./types";

export type { Toast } from "./types";

export const useStore = create<AppState>()((...a) => ({
  ...createUiSlice(...a),
  ...createDaemonSlice(...a),
  ...createProjectSlice(...a),
  ...createProjectSettingsSlice(...a),
  ...createTaskSlice(...a),
  ...createQueueSlice(...a),
  ...createSubagentSlice(...a),
  ...createProviderSlice(...a),
  ...createUsageSlice(...a),
  ...createDiffSlice(...a),
  ...createEditorSlice(...a),
  ...createReviewSlice(...a),
  ...createShipSlice(...a),
  ...createAutomationSlice(...a),
  ...createAccountsSlice(...a),
}));
