import { describe, expect, it } from "vitest";
import type { ProviderSnapshotEntry } from "@interlock/protocol/agent-types";
import { kindOf, toProviderEntries } from "./providers";

const mock: ProviderSnapshotEntry = {
  provider: "mock",
  status: "ready",
  enabled: true,
  defaultModeId: "load-test",
  modes: [{ id: "load-test", label: "Load Test", description: "x" }],
  models: [
    {
      provider: "mock",
      id: "five-minute-stream",
      label: "Five minute stream",
      isDefault: true,
      thinkingOptions: [
        { id: "low", label: "Low", isDefault: true },
        { id: "high", label: "High" },
      ],
      defaultThinkingOptionId: "low",
    },
  ],
};

describe("toProviderEntries", () => {
  it("keeps real models, efforts and modes", () => {
    const [entry] = toProviderEntries([mock]);
    expect(entry).toEqual({
      kind: "mock",
      label: "Mock",
      status: "ready",
      defaultModeId: "load-test",
      modes: [{ id: "load-test", label: "Load Test" }],
      models: [
        {
          id: "five-minute-stream",
          label: "Five minute stream",
          isDefault: true,
          defaultEffort: "low",
          efforts: [
            { id: "low", label: "Low", isDefault: true },
            { id: "high", label: "High", isDefault: false },
          ],
        },
      ],
    });
  });

  it("skips unknown and disabled providers", () => {
    const entries = toProviderEntries([
      { ...mock, provider: "opencode" },
      { ...mock, provider: "claude", enabled: false },
    ]);
    expect(entries).toEqual([]);
    expect(kindOf("gemini")).toBeNull();
  });
});
