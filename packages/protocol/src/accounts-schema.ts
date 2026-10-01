import { z } from "zod";

export const DiagnosticToolIdSchema = z.enum(["git", "claude", "codex", "gh"]);
export type DiagnosticToolId = z.infer<typeof DiagnosticToolIdSchema>;

export const AuthProviderSchema = z.enum(["claude", "codex"]);
export type AuthProvider = z.infer<typeof AuthProviderSchema>;

export const ToolDiagnosticSchema = z.object({
  id: DiagnosticToolIdSchema,
  installed: z.boolean(),
  version: z.string().nullable(),
  path: z.string().nullable(),
  loggedIn: z.boolean().nullable(),
  account: z.string().nullable(),
  plan: z.string().nullable(),
  installCommand: z.string().nullable(),
  loginCommand: z.string().nullable(),
});
export type ToolDiagnostic = z.infer<typeof ToolDiagnosticSchema>;

export const DiagnosticsGetRequestSchema = z.object({
  type: z.literal("diagnostics.get.request"),
  requestId: z.string(),
});

export const DiagnosticsGetResponseSchema = z.object({
  type: z.literal("diagnostics.get.response"),
  payload: z.object({
    requestId: z.string(),
    tools: z.array(ToolDiagnosticSchema),
    error: z.string().nullable(),
  }),
});

export const ProviderAuthLoginRequestSchema = z.object({
  type: z.literal("provider.auth.login.request"),
  requestId: z.string(),
  provider: AuthProviderSchema,
});

export const ProviderAuthLoginResponseSchema = z.object({
  type: z.literal("provider.auth.login.response"),
  payload: z.object({
    requestId: z.string(),
    provider: AuthProviderSchema,
    loginId: z.string().nullable(),
    authUrl: z.string().nullable(),
    opensBrowser: z.boolean(),
    error: z.string().nullable(),
  }),
});

export const ProviderAuthCompletedMessageSchema = z.object({
  type: z.literal("provider.auth.completed"),
  payload: z.object({
    provider: AuthProviderSchema,
    loginId: z.string(),
    success: z.boolean(),
    account: z.string().nullable(),
    error: z.string().nullable(),
  }),
});

export const ProviderAuthLogoutRequestSchema = z.object({
  type: z.literal("provider.auth.logout.request"),
  requestId: z.string(),
  provider: AuthProviderSchema,
});

export const ProviderAuthLogoutResponseSchema = z.object({
  type: z.literal("provider.auth.logout.response"),
  payload: z.object({
    requestId: z.string(),
    provider: AuthProviderSchema,
    error: z.string().nullable(),
  }),
});

export const AccountsInboundSchemas = [
  DiagnosticsGetRequestSchema,
  ProviderAuthLoginRequestSchema,
  ProviderAuthLogoutRequestSchema,
] as const;

export const AccountsOutboundSchemas = [
  DiagnosticsGetResponseSchema,
  ProviderAuthLoginResponseSchema,
  ProviderAuthCompletedMessageSchema,
  ProviderAuthLogoutResponseSchema,
] as const;
