import { describe, expect, it } from "vitest";
import { deriveAspect } from "./aspect";

const base = {
  status: "idle",
  pendingPermissions: 0,
  archived: false,
  hasChanges: false,
  merged: false,
} as const;

describe("deriveAspect", () => {
  it("covers each lifecycle state", () => {
    expect(deriveAspect({ ...base, status: "running" })).toBe("running");
    expect(deriveAspect({ ...base, status: "initializing" })).toBe("queued");
    expect(deriveAspect({ ...base, status: "error" })).toBe("failed");
    expect(deriveAspect(base)).toBe("idle");
    expect(deriveAspect({ ...base, hasChanges: true })).toBe("review");
  });

  it("lets permissions, archiving and merging win in that order", () => {
    expect(deriveAspect({ ...base, status: "running", pendingPermissions: 1 })).toBe("held");
    expect(
      deriveAspect({ ...base, status: "running", pendingPermissions: 1, archived: true }),
    ).toBe("discarded");
    expect(deriveAspect({ ...base, archived: true, merged: true })).toBe("merged");
  });
});
