import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import { describe, expect, it, vi } from "vitest";
import { useStore } from "@/stores/app-store";
import { watchDiff } from "./diff";

const file = (path: string) => ({
  path,
  isNew: false,
  isDeleted: false,
  additions: 1,
  deletions: 0,
  hunks: [],
});

function fakeClient(initial: unknown) {
  const off = vi.fn();
  const unsubscribeCheckoutDiff = vi.fn();
  const subscribeCheckoutDiff = vi.fn(() => Promise.resolve(initial));
  const client = {
    on: () => off,
    subscribeCheckoutDiff,
    unsubscribeCheckoutDiff,
  } as unknown as DaemonClient;
  return { client, subscribeCheckoutDiff, unsubscribeCheckoutDiff, off };
}

describe("watchDiff", () => {
  it("subscribes once from the merge-base to the working tree and stores the files", async () => {
    const fake = fakeClient({ files: [file("a.ts"), file("b.ts")], error: null });
    const stop = watchDiff(fake.client, { id: "t1", cwd: "/repo" });
    await vi.waitFor(() => expect(useStore.getState().diffs["t1"]?.length).toBe(2));

    expect(fake.subscribeCheckoutDiff).toHaveBeenCalledTimes(1);
    expect(fake.subscribeCheckoutDiff).toHaveBeenCalledWith(
      "/repo",
      { mode: "base_worktree" },
      { subscriptionId: "interlock:diff:t1" },
    );
    expect(useStore.getState().diffs["t1"]?.map((f) => f.path)).toEqual(["a.ts", "b.ts"]);

    stop();
    expect(fake.off).toHaveBeenCalled();
    expect(fake.unsubscribeCheckoutDiff).toHaveBeenCalledWith("interlock:diff:t1");
  });
});
