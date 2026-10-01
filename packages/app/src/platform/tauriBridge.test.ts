import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DaemonStatus, DragDrop } from "./types";

type WebviewDrag =
  | { type: "enter" | "drop"; paths: string[] }
  | { type: "over" }
  | { type: "leave" };

const shell = vi.hoisted(() => {
  const emit: (status: DaemonStatus) => void = () => undefined;
  const drag: (event: WebviewDrag) => void = () => undefined;
  return { emit, drag, current: Promise.resolve<DaemonStatus>("ready") };
});

vi.mock("@tauri-apps/api/core", () => ({ invoke: () => shell.current }));
vi.mock("@tauri-apps/api/event", () => ({
  listen: (_event: string, handler: (e: { payload: DaemonStatus }) => void) => {
    shell.emit = (status) => handler({ payload: status });
    return Promise.resolve(() => undefined);
  },
}));
vi.mock("@tauri-apps/api/webview", () => ({
  getCurrentWebview: () => ({
    onDragDropEvent: (handler: (e: { payload: WebviewDrag }) => void) => {
      shell.drag = (event) => handler({ payload: event });
      return Promise.resolve(() => undefined);
    },
  }),
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

describe("tauri drag and drop", () => {
  it("passes on the paths dragged in and dropped, and drops the hover noise", () => {
    const seen: DragDrop[] = [];
    tauriBridge.onDragDrop((drag) => seen.push(drag));
    shell.drag({ type: "enter", paths: ["/code/app"] });
    shell.drag({ type: "over" });
    shell.drag({ type: "leave" });
    shell.drag({ type: "drop", paths: ["/code/app"] });
    expect(seen).toEqual([
      { phase: "enter", paths: ["/code/app"] },
      { phase: "leave" },
      { phase: "drop", paths: ["/code/app"] },
    ]);
  });
});
