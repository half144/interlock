import { describe, expect, it } from "vitest";
import { toToolStatus } from "./diagnostics";

describe("toToolStatus", () => {
  it("keeps what the screens show and drops the binary path", () => {
    const status = toToolStatus({
      id: "claude",
      installed: true,
      version: "2.1.0",
      path: "/usr/local/bin/claude",
      loggedIn: true,
      account: "me@x.dev",
      plan: "Max",
      installCommand: null,
      loginCommand: "claude auth login",
    });
    expect(status).not.toHaveProperty("path");
    expect(status).toMatchObject({ id: "claude", account: "me@x.dev", plan: "Max" });
  });
});
