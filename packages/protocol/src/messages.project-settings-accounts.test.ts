import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROJECT_SETTINGS,
  ProjectSettingsPatchSchema,
  ProjectSettingsSchema,
} from "./project-settings-schema.js";
import { SessionInboundMessageSchema, SessionOutboundMessageSchema } from "./messages.js";

describe("project settings schema", () => {
  it("defaults archiveAfterMerge to true and autonomy to auto", () => {
    expect(ProjectSettingsSchema.parse(DEFAULT_PROJECT_SETTINGS)).toMatchObject({
      archiveAfterMerge: true,
      autonomy: "auto",
    });
  });

  it("leaves the default branch to the detected one until a name is saved", () => {
    expect(DEFAULT_PROJECT_SETTINGS.defaultBranch).toBeNull();
    expect(ProjectSettingsPatchSchema.safeParse({ defaultBranch: "develop" }).success).toBe(true);
    expect(ProjectSettingsPatchSchema.safeParse({ defaultBranch: null }).success).toBe(true);
    expect(ProjectSettingsPatchSchema.safeParse({ defaultBranch: "" }).success).toBe(false);
  });

  it("accepts partial patches and rejects unknown autonomy modes and escaping copy paths", () => {
    expect(ProjectSettingsPatchSchema.safeParse({ autonomy: "full-auto" }).success).toBe(true);
    expect(ProjectSettingsPatchSchema.safeParse({ autonomy: "yolo" }).success).toBe(false);
    expect(ProjectSettingsPatchSchema.safeParse({ copyFiles: ["../x"] }).success).toBe(false);
    expect(ProjectSettingsPatchSchema.safeParse({ copyFiles: ["/abs"] }).success).toBe(false);
    expect(
      ProjectSettingsPatchSchema.safeParse({ copyFiles: [".env", "config/a.json"] }).success,
    ).toBe(true);
  });
});

describe("project settings and accounts messages", () => {
  it.each([
    { type: "project.settings.get.request", requestId: "1", projectId: "p" },
    {
      type: "project.settings.update.request",
      requestId: "1",
      projectId: "p",
      patch: { archiveAfterMerge: false },
    },
    { type: "project.setup.suggest.request", requestId: "1", projectId: "p" },
    { type: "diagnostics.get.request", requestId: "1" },
    { type: "provider.auth.login.request", requestId: "1", provider: "codex" },
    { type: "provider.auth.logout.request", requestId: "1", provider: "claude" },
  ])("parses inbound $type", (message) => {
    expect(SessionInboundMessageSchema.safeParse(message).success).toBe(true);
  });

  it("rejects a login request for an unsupported provider", () => {
    expect(
      SessionInboundMessageSchema.safeParse({
        type: "provider.auth.login.request",
        requestId: "1",
        provider: "gemini",
      }).success,
    ).toBe(false);
  });

  it.each([
    {
      type: "project.settings.get.response",
      payload: {
        requestId: "1",
        projectId: "p",
        settings: DEFAULT_PROJECT_SETTINGS,
        worktreeInclude: [".env"],
        error: null,
      },
    },
    {
      type: "diagnostics.get.response",
      payload: {
        requestId: "1",
        tools: [
          {
            id: "claude",
            installed: true,
            version: "2.1.0",
            path: "/bin/claude",
            loggedIn: true,
            account: "a@b.c",
            plan: "max",
            installCommand: null,
            loginCommand: "claude auth login",
          },
        ],
        error: null,
      },
    },
    {
      type: "provider.auth.login.response",
      payload: {
        requestId: "1",
        provider: "codex",
        loginId: "L1",
        authUrl: "https://auth.openai.com/x",
        opensBrowser: false,
        error: null,
      },
    },
    {
      type: "provider.auth.completed",
      payload: { provider: "codex", loginId: "L1", success: true, account: null, error: null },
    },
    {
      type: "project.add.response",
      payload: {
        requestId: "1",
        project: null,
        error: "not a repo",
        errorCode: "not_a_git_repo",
      },
    },
  ])("parses outbound $type", (message) => {
    expect(SessionOutboundMessageSchema.safeParse(message).success).toBe(true);
  });
});
