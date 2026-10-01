import type { PanelTab } from "@/types";

/** A plain folder has no diff to review and no PR to check: its panel is the terminal and the subagents. */
const GIT_ONLY: PanelTab[] = ["diff", "checks"];

export const hasTab = (tab: PanelTab, git: boolean) => git || !GIT_ONLY.includes(tab);

/** The tab to show: a request for one the agent's folder cannot have lands on the terminal. */
export const shownTab = (tab: PanelTab, git: boolean): PanelTab =>
  hasTab(tab, git) ? tab : "terminal";
