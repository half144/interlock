import { describe, expect, it } from "vitest";
import { toDiscoveredRepository } from "./repositories";

describe("toDiscoveredRepository", () => {
  it("reads the activity time as epoch milliseconds", () => {
    expect(
      toDiscoveredRepository({
        path: "/Users/dev/code/app",
        name: "app",
        lastActivityAt: "2026-09-30T12:00:00.000Z",
      }),
    ).toEqual({
      path: "/Users/dev/code/app",
      name: "app",
      lastActivityAt: Date.UTC(2026, 8, 30, 12),
    });
  });
});
