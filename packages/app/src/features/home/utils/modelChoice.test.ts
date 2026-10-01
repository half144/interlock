import { describe, expect, it } from "vitest";
import type { ProviderEntry } from "@/types";
import { defaultChoice } from "./modelChoice";

const entry = (kind: ProviderEntry["kind"], models: string[]): ProviderEntry => ({
  kind,
  label: kind,
  status: "ready",
  modes: [],
  defaultModeId: null,
  models: models.map((id, i) => ({
    id,
    label: id,
    isDefault: i === 1,
    efforts: [],
    defaultEffort: null,
  })),
});

const providers = [entry("claude", ["opus", "sonnet"]), entry("codex", ["gpt"])];

describe("defaultChoice", () => {
  it("falls back to the first provider's default model", () => {
    expect(defaultChoice(providers, undefined)).toEqual({ kind: "claude", model: "sonnet" });
  });

  it("uses the project's saved agent and model", () => {
    expect(defaultChoice(providers, { defaultKind: "codex", defaultModel: "gpt" })).toEqual({
      kind: "codex",
      model: "gpt",
    });
    expect(defaultChoice(providers, { defaultKind: "claude", defaultModel: "opus" })).toEqual({
      kind: "claude",
      model: "opus",
    });
  });

  it("drops a saved model the provider no longer lists, and a saved agent that is gone", () => {
    expect(defaultChoice(providers, { defaultKind: "claude", defaultModel: "retired" })).toEqual({
      kind: "claude",
      model: "sonnet",
    });
    expect(
      defaultChoice(providers.slice(0, 1), { defaultKind: "codex", defaultModel: null }),
    ).toEqual({
      kind: "claude",
      model: "sonnet",
    });
  });
});
