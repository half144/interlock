import { describe, expect, it } from "vitest";
import { pathOf, routeOf, sameScreen } from "./routes";

describe("routes", () => {
  it("maps each screen to one URL and back", () => {
    const cases = [
      { view: { kind: "yard" as const }, panel: null, path: "/" },
      { view: { kind: "thread" as const, threadId: "abc" }, panel: null, path: "/thread/abc" },
      {
        view: { kind: "thread" as const, threadId: "abc" },
        panel: "diff" as const,
        path: "/thread/abc/code",
      },
      {
        view: { kind: "thread" as const, threadId: "abc" },
        panel: "agents" as const,
        path: "/thread/abc/agents",
      },
      {
        view: { kind: "settings" as const, projectId: "p1" },
        panel: null,
        path: "/project/p1/settings",
      },
      { view: { kind: "automations" as const }, panel: null, path: "/automations" },
      { view: { kind: "accounts" as const }, panel: null, path: "/settings/accounts" },
    ];
    for (const { path, ...route } of cases) {
      expect(pathOf(route)).toBe(path);
      expect(routeOf(path)).toEqual(route);
    }
  });

  it("falls back to home for unknown paths and ignores unknown panel slugs", () => {
    expect(routeOf("/nope")).toEqual({ view: { kind: "yard" }, panel: null });
    expect(routeOf("/thread/a/zzz").panel).toBeNull();
  });

  it("escapes ids", () => {
    expect(
      routeOf(pathOf({ view: { kind: "thread", threadId: "a/b" }, panel: null })).view,
    ).toEqual({
      kind: "thread",
      threadId: "a/b",
    });
  });

  it("tells a panel change from a screen change", () => {
    const thread = { view: { kind: "thread" as const, threadId: "a" }, panel: null };
    expect(sameScreen(thread, { ...thread, panel: "diff" })).toBe(true);
    expect(sameScreen(thread, { view: { kind: "yard" }, panel: null })).toBe(false);
  });
});
