import { describe, expect, it } from "vitest";
import { versionLabel } from "./appVersion";

describe("versionLabel", () => {
  it("names a built app by its commit", () => {
    expect(versionLabel("0.1.0", "747d9d1")).toEqual({
      text: "v0.1.0",
      title: "Interlock 0.1.0, build 747d9d1",
    });
  });

  it("calls the dev server a development build", () => {
    expect(versionLabel("0.1.0", "dev").title).toBe("Interlock 0.1.0, development build");
  });
});
