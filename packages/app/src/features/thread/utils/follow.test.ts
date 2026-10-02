import { describe, expect, it } from "vitest";
import { followStep } from "./follow";

describe("followStep", () => {
  it("covers a share of the distance, never all of a large one at once", () => {
    const step = followStep(200, 16);
    expect(step).toBeGreaterThan(0);
    expect(step).toBeLessThan(40);
  });

  it("moves further the longer the frame took", () => {
    expect(followStep(200, 32)).toBeGreaterThan(followStep(200, 16));
  });

  it("closes the last pixel instead of creeping", () => {
    expect(followStep(0.4, 16)).toBe(0.4);
    expect(followStep(3, 16)).toBeGreaterThanOrEqual(1);
  });

  it("converges", () => {
    let gap = 300;
    for (let i = 0; i < 90; i++) gap -= followStep(gap, 16);
    expect(gap).toBeLessThanOrEqual(0.5);
  });
});
