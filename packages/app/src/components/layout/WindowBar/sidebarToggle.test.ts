import { describe, expect, it } from "vitest";
import { sidebarToggle } from "./sidebarToggle";

describe("sidebarToggle", () => {
  it("restores the layout while the review is maximized, whatever the sidebar was", () => {
    expect(sidebarToggle(true, false).action).toBe("restore");
    expect(sidebarToggle(true, true).action).toBe("restore");
  });

  it("opens a folded sidebar and folds an open one", () => {
    expect(sidebarToggle(false, true)).toEqual({ label: "Expand sidebar", action: "open" });
    expect(sidebarToggle(false, false)).toEqual({ label: "Collapse sidebar", action: "rail" });
  });
});
