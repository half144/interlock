import { describe, expect, it } from "vitest";
import { folderName, lastActive, parentFolder } from "./repositories";

describe("folderName", () => {
  it("is the last segment of the path", () => {
    expect(folderName("/Users/dev/code/app")).toBe("app");
  });
});

describe("parentFolder", () => {
  it("writes the home folder as ~", () => {
    expect(parentFolder("/Users/dev/Documents/work/app")).toBe("~/Documents/work");
    expect(parentFolder("/Users/dev/app")).toBe("~");
  });

  it("keeps paths outside home as they are", () => {
    expect(parentFolder("/opt/src/app")).toBe("/opt/src");
    expect(parentFolder("/app")).toBe("/");
  });
});

describe("lastActive", () => {
  const now = Date.UTC(2026, 9, 1, 12);

  it("says how long ago, in the shortest unit", () => {
    expect(lastActive(now - 20_000, now)).toBe("just now");
    expect(lastActive(now - 5 * 60_000, now)).toBe("5m ago");
    expect(lastActive(now - 3 * 3_600_000, now)).toBe("3h ago");
    expect(lastActive(now - 2 * 86_400_000, now)).toBe("2d ago");
  });
});
