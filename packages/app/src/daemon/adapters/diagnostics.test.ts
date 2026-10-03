import { describe, expect, it } from "vitest";
import { toExecutablePatch, toToolStatus } from "./diagnostics";

describe("toToolStatus", () => {
  it("keeps the resolved path and defaults to the standard executable", () => {
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
    expect(status).toMatchObject({ path: "/usr/local/bin/claude", executable: "claude" });
    expect(status).toMatchObject({ id: "claude", account: "me@x.dev", plan: "Max" });
  });
});

describe("toExecutablePatch", () => {
  it("changes only the executable and preserves existing prefix arguments", () => {
    expect(
      toExecutablePatch("claude", " claude+60 ", {
        command: ["claude", "--setting", "value"],
        env: { KEY: "value" },
      }),
    ).toEqual({
      providers: { claude: { command: ["claude+60", "--setting", "value"] } },
    });
  });

  it("treats a path containing spaces as one executable", () => {
    expect(toExecutablePatch("codex", "/my tools/codex", {})).toEqual({
      providers: { codex: { command: ["/my tools/codex"] } },
    });
  });
});
