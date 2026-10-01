import { describe, expect, it } from "vitest";
import { canShow, shouldRequestPermission } from "./webNotification";

describe("web notification permission", () => {
  it("asks only when undecided", () => {
    expect(shouldRequestPermission("default")).toBe(true);
    expect(shouldRequestPermission("denied")).toBe(false);
    expect(shouldRequestPermission("granted")).toBe(false);
  });

  it("shows only when granted", () => {
    expect(canShow("granted")).toBe(true);
    expect(canShow("default")).toBe(false);
  });
});
