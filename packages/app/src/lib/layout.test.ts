import { describe, expect, it } from "vitest";
import { SIDEBAR_WIDTH } from "@/hooks/useRail";
import { WINDOW_BAR_CLEARANCE, barInset } from "./layout";

describe("barInset", () => {
  it("is nothing while the open sidebar already covers the window controls", () => {
    expect(barInset(SIDEBAR_WIDTH.open)).toBe(0);
  });

  it("makes up the difference beside the rail", () => {
    expect(barInset(SIDEBAR_WIDTH.rail)).toBe(WINDOW_BAR_CLEARANCE - SIDEBAR_WIDTH.rail);
  });

  it("is the whole clearance when the sidebar steps out", () => {
    expect(barInset(0)).toBe(WINDOW_BAR_CLEARANCE);
  });
});
