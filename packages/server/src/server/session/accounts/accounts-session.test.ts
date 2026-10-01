import { describe, expect, it, vi } from "vitest";
import type pino from "pino";
import type { ClaudeAuth } from "../../accounts/claude-auth.js";
import type { CodexAuth } from "../../accounts/codex-auth.js";
import type { SessionOutboundMessage } from "../../messages.js";
import { AccountsSession } from "./accounts-session.js";

const logger = { warn: vi.fn(), error: vi.fn() } as unknown as pino.Logger;

function setup(overrides: { claude?: Partial<ClaudeAuth>; codex?: Partial<CodexAuth> }) {
  const emitted: SessionOutboundMessage[] = [];
  const session = new AccountsSession({
    host: { emit: (msg) => emitted.push(msg) },
    logger,
    claudeAuth: overrides.claude as ClaudeAuth,
    codexAuth: overrides.codex as CodexAuth,
  });
  return { session, emitted };
}

describe("AccountsSession", () => {
  it("returns the Codex auth URL and emits provider.auth.completed when the login finishes", async () => {
    let finish: (value: {
      success: boolean;
      account: string | null;
      error: string | null;
    }) => void = () => undefined;
    const { session, emitted } = setup({
      codex: {
        startLogin: async () => ({
          loginId: "L1",
          authUrl: "https://auth.openai.com/x",
          done: new Promise((resolve) => {
            finish = resolve;
          }),
          cancel: async () => undefined,
        }),
      },
    });

    await session.handleLoginRequest({
      type: "provider.auth.login.request",
      requestId: "r1",
      provider: "codex",
    });
    finish({ success: true, account: "dev@example.com", error: null });
    await vi.waitFor(() => expect(emitted).toHaveLength(2));

    expect(emitted[0]).toEqual({
      type: "provider.auth.login.response",
      payload: {
        requestId: "r1",
        provider: "codex",
        loginId: "L1",
        authUrl: "https://auth.openai.com/x",
        opensBrowser: false,
        error: null,
      },
    });
    expect(emitted[1]).toEqual({
      type: "provider.auth.completed",
      payload: {
        provider: "codex",
        loginId: "L1",
        success: true,
        account: "dev@example.com",
        error: null,
      },
    });
  });

  it("runs the Claude CLI login, flags that the CLI opens the browser and confirms the account", async () => {
    const { session, emitted } = setup({
      claude: {
        startLogin: async () => ({
          authUrl: "https://claude.ai/oauth",
          done: Promise.resolve({ success: true, error: null }),
          cancel: () => undefined,
        }),
        status: async () => ({ loggedIn: true, account: "dev@example.com", plan: "max" }),
      },
    });

    await session.handleLoginRequest({
      type: "provider.auth.login.request",
      requestId: "r2",
      provider: "claude",
    });
    await vi.waitFor(() => expect(emitted).toHaveLength(2));

    expect(emitted[0]).toMatchObject({
      type: "provider.auth.login.response",
      payload: { authUrl: "https://claude.ai/oauth", opensBrowser: true, error: null },
    });
    expect(emitted[1]).toMatchObject({
      type: "provider.auth.completed",
      payload: { provider: "claude", success: true, account: "dev@example.com" },
    });
  });

  it("answers a failed login start with the error and no completion event", async () => {
    const { session, emitted } = setup({
      claude: {
        startLogin: async () => {
          throw new Error("Claude Code is not installed");
        },
      },
    });

    await session.handleLoginRequest({
      type: "provider.auth.login.request",
      requestId: "r3",
      provider: "claude",
    });

    expect(emitted).toEqual([
      {
        type: "provider.auth.login.response",
        payload: {
          requestId: "r3",
          provider: "claude",
          loginId: null,
          authUrl: null,
          opensBrowser: false,
          error: "Claude Code is not installed",
        },
      },
    ]);
  });

  it("cancels the login in flight when the session is disposed", async () => {
    const cancel = vi.fn(async () => undefined);
    const { session } = setup({
      codex: {
        startLogin: async () => ({
          loginId: "L1",
          authUrl: "https://auth.openai.com/x",
          done: new Promise(() => undefined),
          cancel,
        }),
      },
    });
    await session.handleLoginRequest({
      type: "provider.auth.login.request",
      requestId: "r4",
      provider: "codex",
    });

    await session.dispose();

    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("logs out and reports provider errors", async () => {
    const { session, emitted } = setup({
      claude: { logout: async () => undefined },
      codex: {
        logout: async () => {
          throw new Error("app-server failed");
        },
      },
    });

    await session.handleLogoutRequest({
      type: "provider.auth.logout.request",
      requestId: "r5",
      provider: "claude",
    });
    await session.handleLogoutRequest({
      type: "provider.auth.logout.request",
      requestId: "r6",
      provider: "codex",
    });

    expect(emitted).toEqual([
      {
        type: "provider.auth.logout.response",
        payload: { requestId: "r5", provider: "claude", error: null },
      },
      {
        type: "provider.auth.logout.response",
        payload: { requestId: "r6", provider: "codex", error: "app-server failed" },
      },
    ]);
  });
});
