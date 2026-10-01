import { describe, expect, it } from "vitest";
import { connectionFromEnv } from "./daemonEnv";

describe("connectionFromEnv", () => {
  it("reads url and token", () => {
    expect(
      connectionFromEnv({ VITE_DAEMON_URL: "ws://127.0.0.1:6868/ws", VITE_DAEMON_TOKEN: "t" }),
    ).toEqual({ url: "ws://127.0.0.1:6868/ws", token: "t" });
  });

  it("explains what is missing", () => {
    expect(() => connectionFromEnv({ VITE_DAEMON_URL: "ws://x" })).toThrow(/VITE_DAEMON_TOKEN/);
    expect(() => connectionFromEnv({})).toThrow(/VITE_DAEMON_URL/);
  });
});
