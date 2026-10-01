import { describe, expect, it } from "vitest";
import type { ProviderEntry } from "@/types";
import { defaultModelId, effortsOf, modelLabel, providerOptions } from "./providers";

const claude: ProviderEntry = {
  kind: "claude",
  label: "Claude Code",
  status: "ready",
  defaultModeId: "auto",
  modes: [],
  models: [
    { id: "opus", label: "Opus", isDefault: false, efforts: [], defaultEffort: null },
    {
      id: "sonnet",
      label: "Sonnet",
      isDefault: true,
      efforts: [{ id: "low", label: "Low", isDefault: true }],
      defaultEffort: "low",
    },
  ],
};

describe("provider catalog helpers", () => {
  it("picks the default model, else the first", () => {
    expect(defaultModelId([claude], "claude")).toBe("sonnet");
    expect(defaultModelId([], "codex")).toBeNull();
  });

  it("names a model by its catalog label and falls back to the id", () => {
    expect(modelLabel([claude], "claude", "opus")).toBe("Opus");
    expect(modelLabel([claude], "claude", "gone")).toBe("gone");
    expect(modelLabel([claude], "claude", null)).toBe("Default model");
  });

  it("lists the efforts of the model and the providers as options", () => {
    expect(effortsOf([claude], "claude", "sonnet").map((e) => e.id)).toEqual(["low"]);
    expect(effortsOf([claude], "claude", "none")).toEqual([]);
    expect(providerOptions([claude])).toEqual([{ value: "claude", label: "Claude Code" }]);
  });
});
