import { describe, expect, it } from "vitest";
import { hasTab, shownTab } from "./panelTabs";

describe("panelTabs", () => {
  it("offers every tab in a git project", () => {
    expect(["diff", "terminal", "checks", "agents"].every((t) => hasTab(t as never, true))).toBe(
      true,
    );
  });

  it("drops the diff and the checks for a plain folder", () => {
    expect(hasTab("diff", false)).toBe(false);
    expect(hasTab("checks", false)).toBe(false);
    expect(hasTab("terminal", false)).toBe(true);
    expect(hasTab("agents", false)).toBe(true);
  });

  it("sends a request for a git tab to the terminal", () => {
    expect(shownTab("diff", false)).toBe("terminal");
    expect(shownTab("agents", false)).toBe("agents");
    expect(shownTab("diff", true)).toBe("diff");
  });
});
