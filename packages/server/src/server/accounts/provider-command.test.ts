import { describe, expect, it } from "vitest";
import { configuredCommand, displayCommand, resolveAccountCommand } from "./provider-command.js";

describe("provider commands", () => {
  it("reads the command from the same mutable config used by task providers", () => {
    const config = {
      providers: { claude: { command: ["claude+60", "--profile", "work"] } },
      metadataGeneration: { providers: [] },
      autoArchiveAfterMerge: false,
      appendSystemPrompt: "",
    };
    expect(configuredCommand(config, "claude")).toEqual(["claude+60", "--profile", "work"]);
    expect(configuredCommand(config, "codex")).toBeUndefined();
  });

  it("resolves a custom executable without splitting prefix arguments", async () => {
    expect(await resolveAccountCommand("codex", [process.execPath, "a path with spaces"])).toEqual({
      command: process.execPath,
      args: ["a path with spaces"],
    });
  });

  it("explains how to fix a missing executable without falling back to another binary", async () => {
    await expect(
      resolveAccountCommand("claude", ["/no-such-interlock-executable"]),
    ).rejects.toThrow("Choose an executable on your PATH or enter its full path in Accounts.");
  });

  it("quotes paths and embedded single quotes for the terminal hint", () => {
    expect(displayCommand(["/my tools/claude", "it's", "auth", "login"])).toBe(
      "'/my tools/claude' 'it'\\''s' auth login",
    );
  });
});
