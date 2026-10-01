import { describe, expect, test } from "vitest";

import { withCodexPlanTool } from "./plan-tool.js";

describe("withCodexPlanTool", () => {
  test("turns the update_plan tool on next to the other tool settings", () => {
    expect(withCodexPlanTool({ model: "gpt", tools: { web_search: "live" } })).toEqual({
      model: "gpt",
      tools: { web_search: "live", update_plan: { enabled: true } },
    });
  });

  test("keeps an update_plan setting the provider options already carry", () => {
    const config = { tools: { update_plan: { enabled: false } } };
    expect(withCodexPlanTool(config)).toBe(config);
  });
});
