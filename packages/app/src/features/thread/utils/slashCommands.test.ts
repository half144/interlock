import { describe, expect, it } from "vitest";
import { commandsFor, matchSlash, parseSlash, skillCommands } from "./slashCommands";

describe("slash commands", () => {
  const commands = commandsFor(true);

  it("offers nothing where the provider cannot plan", () => {
    expect(commandsFor(false)).toEqual([]);
  });

  it("matches a lone slash word by prefix", () => {
    expect(matchSlash(commands, "/pl").map((c) => c.name)).toEqual(["/plan"]);
    expect(matchSlash(commands, "/review")).toEqual([]);
    expect(matchSlash(commands, "hello /pl")).toEqual([]);
    expect(matchSlash(commands, "/plan fix it")).toEqual([]);
  });

  it("splits a command from the message that follows it", () => {
    expect(parseSlash(commands, "/plan add a refund endpoint")).toMatchObject({
      command: { name: "/plan" },
      rest: "add a refund endpoint",
    });
    expect(parseSlash(commands, "/PLAN")).toMatchObject({ rest: "" });
    expect(parseSlash(commands, "/handoff x")).toBeNull();
  });

  it("offers the project's skills next to the commands", () => {
    const all = [...commands, ...skillCommands([{ name: "review", description: "Review a diff" }])];
    expect(matchSlash(all, "/re")).toEqual([{ name: "/review", hint: "Review a diff" }]);
    expect(parseSlash(commands, "/review the diff")).toBeNull();
  });
});
