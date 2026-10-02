import { describe, expect, it } from "vitest";
import type { Agent } from "@/types";
import { settingsTarget, settingsView } from "./settingsTarget";

const agents = { t1: { projectId: "b" } as Agent };
const base = { agents, projectFilter: null, projectIds: ["a", "b"] };

describe("settingsTarget", () => {
  it("stays on the project whose settings are open", () => {
    expect(settingsTarget({ ...base, view: { kind: "settings", projectId: "b" } })).toBe("b");
  });

  it("prefers the project of the open task", () => {
    expect(settingsTarget({ ...base, view: { kind: "thread", threadId: "t1" } })).toBe("b");
  });

  it("then the filtered project, then the first", () => {
    expect(settingsTarget({ ...base, projectFilter: "b", view: { kind: "yard" } })).toBe("b");
    expect(settingsTarget({ ...base, view: { kind: "yard" } })).toBe("a");
  });

  it("is null without projects", () => {
    expect(settingsTarget({ ...base, projectIds: [], view: { kind: "yard" } })).toBeNull();
  });
});

describe("settingsView", () => {
  it("opens the project's settings", () => {
    expect(settingsView({ ...base, view: { kind: "yard" } })).toEqual({
      kind: "settings",
      projectId: "a",
    });
  });

  it("opens Accounts while there is no project", () => {
    expect(settingsView({ ...base, projectIds: [], view: { kind: "yard" } })).toEqual({
      kind: "accounts",
    });
  });
});
