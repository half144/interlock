import type { ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { ClaudeAuth, ClaudeCliMissingError } from "./claude-auth.js";
import type { CommandRunner } from "./command-runner.js";

function fakeChild() {
  const child = new EventEmitter() as EventEmitter & {
    stdout: PassThrough;
    stderr: PassThrough;
    kill: ReturnType<typeof vi.fn>;
  };
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = vi.fn();
  return child;
}

const loggedIn = JSON.stringify({
  loggedIn: true,
  email: "dev@example.com",
  subscriptionType: "max",
});

function auth(options: { run?: CommandRunner; child?: ReturnType<typeof fakeChild> }) {
  const spawn = vi.fn(() => options.child as unknown as ChildProcess);
  return {
    spawn,
    auth: new ClaudeAuth({
      findBinary: async () => "/bin/claude",
      run: options.run ?? (async () => ({ exitCode: 0, stdout: loggedIn, stderr: "" })),
      spawn,
    }),
  };
}

describe("ClaudeAuth", () => {
  it("uses the selected wrapper and its prefix arguments for status, login and logout", async () => {
    const child = fakeChild();
    const run = vi.fn<CommandRunner>(async () => ({ exitCode: 0, stdout: loggedIn, stderr: "" }));
    const spawn = vi.fn(() => child as unknown as ChildProcess);
    const selected = new ClaudeAuth({
      resolveCommand: async () => ({ command: "/my tools/claude+60", args: ["--profile", "work"] }),
      run,
      spawn,
    });
    await selected.status();
    await selected.logout();
    const pending = selected.startLogin();
    child.stdout.write("https://claude.ai/login\n");
    const login = await pending;
    child.emit("exit", 0);
    await login.done;
    expect(run).toHaveBeenCalledWith("/my tools/claude+60", [
      "--profile",
      "work",
      "auth",
      "status",
      "--json",
    ]);
    expect(run).toHaveBeenCalledWith("/my tools/claude+60", [
      "--profile",
      "work",
      "auth",
      "logout",
    ]);
    expect(spawn).toHaveBeenCalledWith("/my tools/claude+60", [
      "--profile",
      "work",
      "auth",
      "login",
    ]);
  });

  it("reads login state, account and plan from `claude auth status --json`", async () => {
    const run = vi.fn<CommandRunner>(async () => ({ exitCode: 0, stdout: loggedIn, stderr: "" }));

    const status = await auth({ run }).auth.status();

    expect(run).toHaveBeenCalledWith("/bin/claude", ["auth", "status", "--json"]);
    expect(status).toEqual({ loggedIn: true, account: "dev@example.com", plan: "max" });
  });

  it("treats unreadable status output as logged out", async () => {
    const run: CommandRunner = async () => ({ exitCode: 1, stdout: "", stderr: "boom" });

    expect(await auth({ run }).auth.status()).toEqual({
      loggedIn: false,
      account: null,
      plan: null,
    });
  });

  it("explains how to install the CLI when it is missing", async () => {
    const missing = new ClaudeAuth({ findBinary: async () => null });

    await expect(missing.status()).rejects.toBeInstanceOf(ClaudeCliMissingError);
  });

  it("captures the URL the login prints, then confirms with auth status when the CLI exits 0", async () => {
    const child = fakeChild();
    const { auth: claude, spawn } = auth({ child });

    const pending = claude.startLogin();
    child.stdout.write(
      "Opening browser. If it does not open, visit https://claude.ai/oauth/authorize?code=1\n",
    );
    const login = await pending;
    child.emit("exit", 0);

    expect(spawn).toHaveBeenCalledWith("/bin/claude", ["auth", "login"]);
    expect(login.authUrl).toBe("https://claude.ai/oauth/authorize?code=1");
    expect(await login.done).toEqual({ success: true, error: null });
  });

  it("fails the login when the CLI exits non-zero, with the CLI output in the error", async () => {
    const child = fakeChild();
    const { auth: claude } = auth({ child });

    const pending = claude.startLogin();
    child.stdout.write("https://claude.ai/login\n");
    const login = await pending;
    child.stderr.write("access denied");
    child.emit("exit", 1);

    const result = await login.done;
    expect(result.success).toBe(false);
    expect(result.error).toContain("access denied");
  });

  it("reports failure when the CLI exits 0 but status still says logged out", async () => {
    const child = fakeChild();
    const run: CommandRunner = async () => ({
      exitCode: 1,
      stdout: JSON.stringify({ loggedIn: false }),
      stderr: "",
    });
    const { auth: claude } = auth({ child, run });

    const pending = claude.startLogin();
    child.stdout.write("https://claude.ai/login\n");
    const login = await pending;
    child.emit("exit", 0);

    expect((await login.done).success).toBe(false);
  });

  it("returns no URL when the CLI opens the browser silently", async () => {
    vi.useFakeTimers();
    try {
      const child = fakeChild();
      const pending = auth({ child }).auth.startLogin();
      await vi.advanceTimersByTimeAsync(5_000);
      const login = await pending;

      expect(login.authUrl).toBeNull();
      login.cancel();
      expect(child.kill).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("logs out through `claude auth logout` and surfaces failures", async () => {
    const run = vi.fn<CommandRunner>(async () => ({ exitCode: 0, stdout: "", stderr: "" }));
    await auth({ run }).auth.logout();
    expect(run).toHaveBeenCalledWith("/bin/claude", ["auth", "logout"]);

    const failing: CommandRunner = async () => ({
      exitCode: 1,
      stdout: "",
      stderr: "keychain locked",
    });
    await expect(auth({ run: failing }).auth.logout()).rejects.toThrow(/keychain locked/);
  });
});
