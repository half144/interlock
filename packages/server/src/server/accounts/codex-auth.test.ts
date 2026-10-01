import { describe, expect, it, vi } from "vitest";
import type { Logger } from "pino";
import { CodexAuth, type CodexRpcClient } from "./codex-auth.js";

type Notify = (method: string, params: unknown) => void;

function fakeClient(responses: Record<string, unknown>) {
  let notify: Notify = () => undefined;
  const client = {
    request: vi.fn(async (method: string) => {
      if (!(method in responses)) throw new Error(`unexpected ${method}`);
      return responses[method];
    }),
    notify: vi.fn(),
    setNotificationHandler: vi.fn((handler: Notify) => {
      notify = handler;
    }),
    dispose: vi.fn(async () => undefined),
  };
  return { client: client satisfies CodexRpcClient, emit: (m: string, p: unknown) => notify(m, p) };
}

const logger = {} as Logger;
const chatgpt = { account: { type: "chatgpt", email: "dev@example.com", planType: "plus" } };

describe("CodexAuth", () => {
  it("reads account and plan with account/read after initializing", async () => {
    const { client } = fakeClient({ initialize: {}, "account/read": chatgpt });

    const status = await new CodexAuth({ logger, createClient: async () => client }).status();

    expect(status).toEqual({ loggedIn: true, account: "dev@example.com", plan: "plus" });
    expect(client.notify).toHaveBeenCalledWith("initialized", {});
    expect(client.dispose).toHaveBeenCalled();
  });

  it("reports logged out when account/read returns no account", async () => {
    const { client } = fakeClient({ initialize: {}, "account/read": { account: null } });

    const status = await new CodexAuth({ logger, createClient: async () => client }).status();

    expect(status).toEqual({ loggedIn: false, account: null, plan: null });
  });

  it("starts a ChatGPT login, returns the auth URL and resolves on account/login/completed", async () => {
    const { client, emit } = fakeClient({
      initialize: {},
      "account/login/start": {
        type: "chatgpt",
        authUrl: "https://auth.openai.com/x",
        loginId: "L1",
      },
      "account/read": chatgpt,
    });
    const codex = new CodexAuth({ logger, createClient: async () => client });

    const login = await codex.startLogin();
    expect(login).toMatchObject({ loginId: "L1", authUrl: "https://auth.openai.com/x" });
    expect(client.request).toHaveBeenCalledWith("account/login/start", { type: "chatgpt" });
    expect(client.dispose).not.toHaveBeenCalled();

    emit("account/login/completed", { success: true, loginId: "L1", error: null });

    expect(await login.done).toEqual({ success: true, account: "dev@example.com", error: null });
    expect(client.dispose).toHaveBeenCalled();
  });

  it("ignores completion notifications for other logins and reports failures", async () => {
    const { client, emit } = fakeClient({
      initialize: {},
      "account/login/start": {
        type: "chatgpt",
        authUrl: "https://auth.openai.com/x",
        loginId: "L1",
      },
    });
    const login = await new CodexAuth({ logger, createClient: async () => client }).startLogin();

    emit("account/login/completed", { success: true, loginId: "other" });
    emit("account/login/completed", { success: false, loginId: "L1", error: "denied" });

    expect(await login.done).toEqual({ success: false, account: null, error: "denied" });
  });

  it("cancels a pending login and closes the app-server", async () => {
    const { client } = fakeClient({
      initialize: {},
      "account/login/start": {
        type: "chatgpt",
        authUrl: "https://auth.openai.com/x",
        loginId: "L1",
      },
      "account/login/cancel": {},
    });
    const login = await new CodexAuth({ logger, createClient: async () => client }).startLogin();

    await login.cancel();

    expect(client.request).toHaveBeenCalledWith("account/login/cancel", { loginId: "L1" });
    expect(client.dispose).toHaveBeenCalled();
  });

  it("closes the app-server and explains the fallback when no URL comes back", async () => {
    const { client } = fakeClient({ initialize: {}, "account/login/start": { type: "apiKey" } });

    await expect(
      new CodexAuth({ logger, createClient: async () => client }).startLogin(),
    ).rejects.toThrow(/codex login/);
    expect(client.dispose).toHaveBeenCalled();
  });

  it("logs out through account/logout", async () => {
    const { client } = fakeClient({ initialize: {}, "account/logout": {} });

    await new CodexAuth({ logger, createClient: async () => client }).logout();

    expect(client.request).toHaveBeenCalledWith("account/logout", {});
  });
});
