import { toPlanItems, type ShipResult } from "@/daemon/adapters/ship";
import { createPullRequest } from "@/daemon/ship";
import type { Checkout, SetupRun, ShippedPullRequest } from "@/types";
import type { SliceCreator } from "../types";

export interface ShipSlice {
  /** The pull request and forge access of each worktree, by worktree directory. */
  checkouts: Record<string, Checkout>;
  /** What the daemon last said happened to a worktree's pull request: opened, or merged. */
  shipped: Record<string, ShippedPullRequest>;
  /** The worktree setup output, by workspace id. */
  setupRuns: Record<string, SetupRun>;

  setCheckout: (cwd: string, checkout: Checkout) => void;
  setShipped: (cwd: string, pr: ShippedPullRequest) => void;
  setSetupRun: (workspaceId: string, run: SetupRun) => void;
  /** Resolves with what the daemon answered; a refusal is a result, not a throw, so the dialog can explain it. */
  createPullRequest: (agentId: string, title: string) => Promise<ShipResult>;
}

const failure = (error: unknown): ShipResult => ({
  ok: false,
  error: {
    code: "unknown",
    message: error instanceof Error ? error.message : "The daemon did not answer. Try again.",
  },
});

export const createShipSlice: SliceCreator<ShipSlice> = (set, get) => ({
  checkouts: {},
  shipped: {},
  setupRuns: {},

  setCheckout: (cwd, checkout) => set((s) => ({ checkouts: { ...s.checkouts, [cwd]: checkout } })),

  setShipped: (cwd, pr) =>
    set((s) => ({
      shipped: {
        ...s.shipped,
        [cwd]: { ...pr, number: pr.number ?? s.shipped[cwd]?.number ?? null },
      },
    })),

  setSetupRun: (workspaceId, run) =>
    set((s) => ({ setupRuns: { ...s.setupRuns, [workspaceId]: run } })),

  createPullRequest: async (agentId, title) => {
    const { agents, threads } = get();
    const agent = agents[agentId];
    if (!agent) return failure(new Error("This task is no longer open."));
    try {
      const result = await createPullRequest({
        cwd: agent.cwd,
        title,
        baseRef: agent.base,
        planItems: toPlanItems(threads[agentId]?.messages ?? []),
      });
      if (result.ok && result.url) {
        get().setShipped(agent.cwd, { number: result.number, url: result.url, merged: false });
      }
      return result;
    } catch (error) {
      return failure(error);
    }
  },
});
