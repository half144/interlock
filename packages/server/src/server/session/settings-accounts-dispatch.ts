import type { SessionInboundMessage } from "../messages.js";
import type { AccountsSession } from "./accounts/accounts-session.js";
import type { ProjectSettingsSession } from "./project-settings/project-settings-session.js";

export interface SettingsAccountsSessions {
  projectSettings: ProjectSettingsSession;
  accounts: AccountsSession;
}

export function dispatchSettingsAndAccountsMessage(
  sessions: SettingsAccountsSessions,
  msg: SessionInboundMessage,
): Promise<void> | undefined {
  if (msg.type === "project.settings.get.request") {
    return sessions.projectSettings.handleGetRequest(msg);
  }
  if (msg.type === "project.settings.update.request") {
    return sessions.projectSettings.handleUpdateRequest(msg);
  }
  if (msg.type === "project.setup.suggest.request") {
    return sessions.projectSettings.handleSuggestSetupRequest(msg);
  }
  if (msg.type === "diagnostics.get.request") {
    return sessions.accounts.handleDiagnosticsRequest(msg);
  }
  if (msg.type === "provider.auth.login.request") {
    return sessions.accounts.handleLoginRequest(msg);
  }
  if (msg.type === "provider.auth.logout.request") {
    return sessions.accounts.handleLogoutRequest(msg);
  }
  return undefined;
}
