import type { ProcessEnvRecord } from "../../../paseo-env.js";

/**
 * Claude Code keeps its task tools (TaskCreate, TaskUpdate, TaskList) off for newer models unless
 * `CLAUDE_CODE_ENABLE_TODO_TOOLS` is set, and those tools are where the plan comes from. A value already in the
 * environment wins.
 */
export const withClaudePlanTools = (env: ProcessEnvRecord): ProcessEnvRecord => ({
  CLAUDE_CODE_ENABLE_TODO_TOOLS: "1",
  ...env,
});
