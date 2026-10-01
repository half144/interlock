import { describe, expect, test } from "vitest";

import { withClaudePlanTools } from "./plan-tools.js";

describe("withClaudePlanTools", () => {
  test("turns Claude's task tools on", () => {
    expect(withClaudePlanTools({ PATH: "/bin" })).toEqual({
      CLAUDE_CODE_ENABLE_TODO_TOOLS: "1",
      PATH: "/bin",
    });
  });

  test("keeps a value the environment already sets", () => {
    expect(withClaudePlanTools({ CLAUDE_CODE_ENABLE_TODO_TOOLS: "0" })).toEqual({
      CLAUDE_CODE_ENABLE_TODO_TOOLS: "0",
    });
  });
});
