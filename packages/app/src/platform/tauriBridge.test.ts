import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DaemonStatus } from "./types";

const shell = vi.hoisted(() => {
  const emit: (status: DaemonStatus) => void = () => undefined;
  return { emit, current: Promise.resolve<DaemonStatus>("ready") };
});

vi.mock("@tauri-apps/api/core", () => ({ invoke: () => shell.current }));
vi.mock("@tauri-apps/api/event", () => ({
  listen: (_event: string, handler: (e: { payload: DaemonStatus }) => void) => {
    shell.emit = (status) => handler({ payload: status });
    return Promise.resolve(() => undefined);
  },
}));

const { tauriBridge } = await import("./tauriBridge");

describe("tauri daemon status", () => {
  beforeEach(() => {
    shell.current = Promise.resolve("ready");
  });

  it("reports the current status when ready was emitted before subscribing", async () => {
    const seen: DaemonStatus[] = [];
    tauriBridge.onDaemonStatus((status) => seen.push(status));
    await shell.current;
    expect(seen).toEqual(["ready"]);
  });

  it("keeps a newer event over the slower status read", async () => {
    let resolve: (status: DaemonStatus) => void = () => undefined;
    shell.current = new Promise((r) => (resolve = r));
    const seen: DaemonStatus[] = [];
    tauriBridge.onDaemonStatus((status) => seen.push(status));
    shell.emit("crashed");
    resolve("ready");
    await shell.current;
    expect(seen).toEqual(["crashed"]);
  });
});
