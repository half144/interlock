import type { PanelTab, View } from "@/types";
import { nextToastId, patchAgent } from "../helpers";
import type { AppState, SliceCreator, Toast } from "../types";

type SidebarMode = "auto" | "open" | "rail";

export interface UiSlice {
  view: View;
  selectedAgentId: string | null;
  /** The subagent open in the Agents tab; null shows the main agent's overview. */
  selectedSubagentId: string | null;
  panelTab: PanelTab;
  panelOpen: boolean;
  paletteOpen: boolean;
  newTaskProjectId: string | null;
  projectFilter: string | null;
  sidebar: SidebarMode;
  /** The review maximized into a mini-IDE: files, code and chat side by side, no sidebar. */
  reviewMaximized: boolean;
  toasts: Toast[];

  go: (view: View) => void;
  openThread: (threadId: string) => void;
  openPanel: (tab?: PanelTab) => void;
  openSubagent: (id: string | null) => void;
  setPanelTab: (tab: PanelTab) => void;
  setPanelOpen: (open: boolean) => void;
  setPalette: (open: boolean) => void;
  newTask: (projectId?: string) => void;
  setProjectFilter: (projectId: string | null) => void;
  setSidebar: (mode: SidebarMode) => void;
  setReviewMaximized: (maximized: boolean) => void;
  dismissToast: (id: number) => void;
  /** Marks a task that wants you while you are elsewhere: an unseen count and a toast. */
  flagTask: (agentId: string, text: string) => void;
}

/**
 * Opening the side panel hands the sidebar back to auto, so it tucks away again even after you expanded
 * it by hand. Expanding it while the panel is already open still holds until the panel next opens.
 */
const tuckSidebar = (s: AppState) =>
  s.panelOpen || s.sidebar !== "open" ? {} : { sidebar: "auto" as const };

export const createUiSlice: SliceCreator<UiSlice> = (set) => ({
  view: { kind: "yard" },
  selectedAgentId: null,
  selectedSubagentId: null,
  panelTab: "diff",
  panelOpen: false,
  paletteOpen: false,
  newTaskProjectId: null,
  projectFilter: null,
  sidebar: "auto",
  reviewMaximized: false,
  toasts: [],

  go: (view) => set({ view, paletteOpen: false, reviewMaximized: false }),

  openThread: (threadId) => {
    set((s) => ({
      view: { kind: "thread", threadId },
      selectedAgentId: threadId,
      selectedSubagentId: null,
      panelOpen: false,
      paletteOpen: false,
      reviewMaximized: false,
      agents: patchAgent(s.agents, threadId, { unseen: 0 }),
    }));
  },

  // The mini-IDE only exists for the review: leaving the Code tab, the panel or the chat leaves it too.
  openPanel: (tab) =>
    set((s) => ({
      ...tuckSidebar(s),
      panelOpen: true,
      panelTab: tab ?? s.panelTab,
      ...(tab && tab !== "diff" ? { reviewMaximized: false } : {}),
    })),
  openSubagent: (selectedSubagentId) =>
    set((s) => ({
      ...tuckSidebar(s),
      panelOpen: true,
      panelTab: "agents",
      selectedSubagentId,
      reviewMaximized: false,
    })),
  setPanelTab: (panelTab) =>
    set((s) => ({ panelTab, reviewMaximized: panelTab === "diff" && s.reviewMaximized })),
  setPanelOpen: (panelOpen) =>
    set((s) => ({ ...(panelOpen ? tuckSidebar(s) : { reviewMaximized: false }), panelOpen })),
  setPalette: (paletteOpen) => set({ paletteOpen }),
  newTask: (projectId) =>
    set({ view: { kind: "yard" }, newTaskProjectId: projectId ?? null, paletteOpen: false }),
  setProjectFilter: (projectFilter) => set({ projectFilter }),
  setSidebar: (sidebar) => set({ sidebar }),
  setReviewMaximized: (reviewMaximized) => set({ reviewMaximized }),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  flagTask: (agentId, text) =>
    set((s) => ({
      agents: patchAgent(s.agents, agentId, { unseen: (s.agents[agentId]?.unseen ?? 0) + 1 }),
      toasts: [...s.toasts, { id: nextToastId(), agentId, text }].slice(-4),
    })),
});
