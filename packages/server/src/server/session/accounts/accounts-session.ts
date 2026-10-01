import type pino from "pino";
import type { AuthProvider } from "@interlock/protocol/accounts-schema";
import type { SessionInboundMessage, SessionOutboundMessage } from "../../messages.js";
import { ClaudeAuth } from "../../accounts/claude-auth.js";
import { CodexAuth } from "../../accounts/codex-auth.js";
import { collectToolDiagnostics } from "../../accounts/tool-diagnostics.js";

type LoginRequest = Extract<SessionInboundMessage, { type: "provider.auth.login.request" }>;
type LogoutRequest = Extract<SessionInboundMessage, { type: "provider.auth.logout.request" }>;
type DiagnosticsRequest = Extract<SessionInboundMessage, { type: "diagnostics.get.request" }>;

interface ActiveLogin {
  loginId: string;
  cancel(): Promise<void> | void;
}

export interface AccountsSessionOptions {
  host: { emit(msg: SessionOutboundMessage): void };
  logger: pino.Logger;
  claudeAuth?: ClaudeAuth;
  codexAuth?: CodexAuth;
}

export class AccountsSession {
  private readonly claudeAuth: ClaudeAuth;
  private readonly codexAuth: CodexAuth;
  private readonly activeLogins = new Map<AuthProvider, ActiveLogin>();

  constructor(private readonly options: AccountsSessionOptions) {
    this.claudeAuth = options.claudeAuth ?? new ClaudeAuth();
    this.codexAuth = options.codexAuth ?? new CodexAuth({ logger: options.logger });
  }

  async handleDiagnosticsRequest(msg: DiagnosticsRequest): Promise<void> {
    try {
      const tools = await collectToolDiagnostics({
        logger: this.options.logger,
        claudeAuth: this.claudeAuth,
        codexAuth: this.codexAuth,
      });
      this.options.host.emit({
        type: "diagnostics.get.response",
        payload: { requestId: msg.requestId, tools, error: null },
      });
    } catch (error) {
      this.options.logger.error({ err: error }, "Diagnostics failed");
      this.options.host.emit({
        type: "diagnostics.get.response",
        payload: { requestId: msg.requestId, tools: [], error: errorMessage(error) },
      });
    }
  }

  async handleLoginRequest(msg: LoginRequest): Promise<void> {
    try {
      await this.cancelActiveLogin(msg.provider);
      const started = await this.startLogin(msg.provider);
      this.options.host.emit({
        type: "provider.auth.login.response",
        payload: {
          requestId: msg.requestId,
          provider: msg.provider,
          loginId: started.loginId,
          authUrl: started.authUrl,
          opensBrowser: started.opensBrowser,
          error: null,
        },
      });
    } catch (error) {
      this.options.logger.warn({ err: error, provider: msg.provider }, "Provider login failed");
      this.options.host.emit({
        type: "provider.auth.login.response",
        payload: {
          requestId: msg.requestId,
          provider: msg.provider,
          loginId: null,
          authUrl: null,
          opensBrowser: false,
          error: errorMessage(error),
        },
      });
    }
  }

  async handleLogoutRequest(msg: LogoutRequest): Promise<void> {
    try {
      await this.cancelActiveLogin(msg.provider);
      await (msg.provider === "claude" ? this.claudeAuth.logout() : this.codexAuth.logout());
      this.options.host.emit({
        type: "provider.auth.logout.response",
        payload: { requestId: msg.requestId, provider: msg.provider, error: null },
      });
    } catch (error) {
      this.options.logger.warn({ err: error, provider: msg.provider }, "Provider logout failed");
      this.options.host.emit({
        type: "provider.auth.logout.response",
        payload: { requestId: msg.requestId, provider: msg.provider, error: errorMessage(error) },
      });
    }
  }

  async dispose(): Promise<void> {
    await Promise.all(
      [...this.activeLogins.keys()].map((provider) => this.cancelActiveLogin(provider)),
    );
  }

  private async startLogin(
    provider: AuthProvider,
  ): Promise<{ loginId: string; authUrl: string | null; opensBrowser: boolean }> {
    if (provider === "codex") {
      const login = await this.codexAuth.startLogin();
      this.track(
        provider,
        login.loginId,
        () => login.cancel(),
        async () => {
          const result = await login.done;
          return { success: result.success, account: result.account, error: result.error };
        },
      );
      return { loginId: login.loginId, authUrl: login.authUrl, opensBrowser: false };
    }
    const login = await this.claudeAuth.startLogin();
    const loginId = `claude-${Date.now()}`;
    this.track(
      provider,
      loginId,
      () => login.cancel(),
      async () => {
        const result = await login.done;
        const account = result.success ? (await this.claudeAuth.status()).account : null;
        return { success: result.success, account, error: result.error };
      },
    );
    return { loginId, authUrl: login.authUrl, opensBrowser: true };
  }

  private track(
    provider: AuthProvider,
    loginId: string,
    cancel: () => Promise<void> | void,
    finish: () => Promise<{ success: boolean; account: string | null; error: string | null }>,
  ): void {
    this.activeLogins.set(provider, { loginId, cancel });
    void finish()
      .catch((error: unknown) => ({ success: false, account: null, error: errorMessage(error) }))
      .then((result) => {
        if (this.activeLogins.get(provider)?.loginId !== loginId) return;
        this.activeLogins.delete(provider);
        this.options.host.emit({
          type: "provider.auth.completed",
          payload: { provider, loginId, ...result },
        });
      });
  }

  private async cancelActiveLogin(provider: AuthProvider): Promise<void> {
    const active = this.activeLogins.get(provider);
    if (!active) return;
    this.activeLogins.delete(provider);
    await active.cancel();
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
