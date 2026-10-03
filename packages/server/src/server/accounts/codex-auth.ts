import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { z } from "zod";
import type { Logger } from "pino";
import { findExecutable } from "../../executable-resolution/executable-resolution.js";
import { spawnProcess } from "../../utils/spawn.js";
import { CodexAppServerClient } from "../agent/providers/codex/app-server-transport.js";
import type { ProviderCommandPrefix } from "../agent/provider-launch-config.js";

const LOGIN_TIMEOUT_MS = 10 * 60_000;

const CLIENT_INFO = { name: "interlock", title: "Interlock", version: "0.1.0" } as const;

const AccountReadSchema = z.object({
  account: z
    .object({
      type: z.string(),
      email: z.string().nullish(),
      planType: z.string().nullish(),
    })
    .nullable(),
});

const LoginStartSchema = z.object({
  type: z.string(),
  authUrl: z.string().optional(),
  loginId: z.string().optional(),
});

const LoginCompletedSchema = z.object({
  success: z.boolean(),
  error: z.string().nullish(),
  loginId: z.string().nullish(),
});

export interface CodexRpcClient {
  request(method: string, params?: unknown): Promise<unknown>;
  notify(method: string, params?: unknown): void;
  setNotificationHandler(handler: (method: string, params: unknown) => void): void;
  dispose(): Promise<void>;
}

export interface CodexAccountStatus {
  loggedIn: boolean;
  account: string | null;
  plan: string | null;
}

export interface CodexLoginResult {
  success: boolean;
  account: string | null;
  error: string | null;
}

export interface CodexLoginHandle {
  loginId: string;
  authUrl: string;
  done: Promise<CodexLoginResult>;
  cancel(): Promise<void>;
}

class CodexCliMissingError extends Error {
  constructor() {
    super(
      "Codex is not installed or not on the PATH. Install it with `npm install -g @openai/codex`, then try again.",
    );
    this.name = "CodexCliMissingError";
  }
}

export interface CodexAuthDeps {
  logger: Logger;
  resolveCommand?: () => Promise<ProviderCommandPrefix>;
  createClient?: () => Promise<CodexRpcClient>;
}

export class CodexAuth {
  private readonly createClient: () => Promise<CodexRpcClient>;

  constructor(deps: CodexAuthDeps) {
    this.createClient = deps.createClient ?? (() => spawnCodexAppServer(deps));
  }

  async status(): Promise<CodexAccountStatus> {
    return this.withClient((client) => readAccount(client));
  }

  async logout(): Promise<void> {
    await this.withClient((client) => client.request("account/logout", {}));
  }

  async startLogin(): Promise<CodexLoginHandle> {
    const client = await this.createClient();
    try {
      await initialize(client);
      const started = LoginStartSchema.parse(
        await client.request("account/login/start", { type: "chatgpt" }),
      );
      if (!started.authUrl || !started.loginId) {
        throw new Error(
          "Codex did not return a login URL. Run `codex login` in a terminal instead.",
        );
      }
      const { authUrl, loginId } = started;
      const done = this.awaitCompletion(client, loginId);
      return {
        loginId,
        authUrl,
        done,
        cancel: async () => {
          await client.request("account/login/cancel", { loginId }).catch(() => undefined);
          await client.dispose();
        },
      };
    } catch (error) {
      await client.dispose().catch(() => undefined);
      throw error;
    }
  }

  private awaitCompletion(client: CodexRpcClient, loginId: string): Promise<CodexLoginResult> {
    return new Promise<CodexLoginResult>((resolve) => {
      const timeout = setTimeout(() => {
        void client.dispose().catch(() => undefined);
        resolve({
          success: false,
          account: null,
          error: "Codex login timed out. Start it again.",
        });
      }, LOGIN_TIMEOUT_MS);
      client.setNotificationHandler((method, params) => {
        if (method !== "account/login/completed") return;
        const completed = LoginCompletedSchema.safeParse(params);
        if (!completed.success || (completed.data.loginId && completed.data.loginId !== loginId)) {
          return;
        }
        clearTimeout(timeout);
        void this.finishLogin(client, completed.data).then(resolve);
      });
    });
  }

  private async finishLogin(
    client: CodexRpcClient,
    completed: z.infer<typeof LoginCompletedSchema>,
  ): Promise<CodexLoginResult> {
    try {
      if (!completed.success) {
        return {
          success: false,
          account: null,
          error: completed.error ?? "Codex login was not completed.",
        };
      }
      const status = await readAccount(client);
      return { success: status.loggedIn, account: status.account, error: null };
    } finally {
      await client.dispose().catch(() => undefined);
    }
  }

  private async withClient<T>(use: (client: CodexRpcClient) => Promise<T>): Promise<T> {
    const client = await this.createClient();
    try {
      await initialize(client);
      return await use(client);
    } finally {
      await client.dispose().catch(() => undefined);
    }
  }
}

async function initialize(client: CodexRpcClient): Promise<void> {
  await client.request("initialize", {
    clientInfo: CLIENT_INFO,
    capabilities: { experimentalApi: true },
  });
  client.notify("initialized", {});
}

async function readAccount(client: CodexRpcClient): Promise<CodexAccountStatus> {
  const { account } = AccountReadSchema.parse(await client.request("account/read", {}));
  return {
    loggedIn: account !== null,
    account: account?.email ?? null,
    plan: account?.planType ?? null,
  };
}

async function spawnCodexAppServer(deps: CodexAuthDeps): Promise<CodexRpcClient> {
  const launch = deps.resolveCommand
    ? await deps.resolveCommand()
    : { command: await findExecutable("codex"), args: [] };
  if (!launch.command) throw new CodexCliMissingError();
  const child = spawnProcess(launch.command, [...launch.args, "app-server"], {
    stdio: ["pipe", "pipe", "pipe"],
  });
  return new CodexAppServerClient(child as ChildProcessWithoutNullStreams, deps.logger);
}
