/**
 * Codex leaves its `update_plan` checklist tool off unless `tools.update_plan.enabled` is set, and that tool is
 * where the plan comes from (`turn/plan/updated`). A value the provider options already set wins.
 */
export function withCodexPlanTool(config: Record<string, unknown>): Record<string, unknown> {
  const tools = config.tools;
  const current = typeof tools === "object" && tools !== null ? tools : {};
  if ("update_plan" in current) return config;
  return { ...config, tools: { ...current, update_plan: { enabled: true } } };
}
