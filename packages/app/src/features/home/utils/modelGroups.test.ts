import { describe, expect, it } from "vitest";
import type { ModelOption } from "@/types";
import { groupModels, moveActive, selectionIn } from "./modelGroups";

const model = (id: string, label: string): ModelOption => ({
  id,
  label,
  isDefault: false,
  efforts: [],
  defaultEffort: null,
});

describe("groupModels", () => {
  it("keeps the newest of each family up front and folds the rest", () => {
    const { current, earlier } = groupModels([
      model("o5", "Opus 5"),
      model("o48", "Opus 4.8"),
      model("s5", "Sonnet 5"),
      model("s46", "Sonnet 4.6"),
      model("h45", "Haiku 4.5"),
      model("f51", "Fable 5.1"),
      model("f5", "Fable 5"),
    ]);
    expect(current.map((e) => e.id)).toEqual(["o5", "s5", "h45", "f51"]);
    expect(earlier.map((e) => e.id)).toEqual(["o48", "s46", "f5"]);
  });

  it("compares versions numerically, not as text", () => {
    const { current } = groupModels([model("a", "GPT-5.10-Sol"), model("b", "GPT-5.9-Sol")]);
    expect(current.map((e) => e.id)).toEqual(["a"]);
  });

  it("folds a 1M model into its base, in either order", () => {
    const { current, earlier } = groupModels([
      model("o48w", "Opus 4.8 1M"),
      model("o48", "Opus 4.8"),
      model("o47", "Opus 4.7"),
      model("o47w", "Opus 4.7 1M"),
    ]);
    expect(current).toEqual([{ id: "o48", label: "Opus 4.8", wideId: "o48w" }]);
    expect(earlier).toEqual([{ id: "o47", label: "Opus 4.7", wideId: "o47w" }]);
  });

  it("keeps a lone 1M model as its own row and unversioned models up front", () => {
    const { current, earlier } = groupModels([
      model("w", "Opus 4.8 1M"),
      model("m", "Bursty stream"),
    ]);
    expect(current.map((e) => [e.id, e.wideId])).toEqual([
      ["w", null],
      ["m", null],
    ]);
    expect(earlier).toEqual([]);
  });
});

describe("selectionIn", () => {
  const entry = { id: "a", label: "A", wideId: "w" };
  it("tells which twin is chosen", () => {
    expect(selectionIn(entry, "a")).toBe("base");
    expect(selectionIn(entry, "w")).toBe("wide");
    expect(selectionIn(entry, "x")).toBeNull();
  });
});

describe("moveActive", () => {
  it("steps within the list and stops at its ends", () => {
    expect(moveActive("ArrowDown", ["a", "b"], "a")).toBe("b");
    expect(moveActive("ArrowDown", ["a", "b"], "b")).toBe("b");
    expect(moveActive("ArrowUp", ["a", "b"], "a")).toBe("a");
    expect(moveActive("End", ["a", "b", "c"], "a")).toBe("c");
    expect(moveActive("x", ["a"], "a")).toBeNull();
  });
});
