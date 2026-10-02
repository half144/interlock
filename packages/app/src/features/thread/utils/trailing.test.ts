import { describe, expect, it } from "vitest";
import type { Message } from "@/types";
import { withoutStaleCards } from "./trailing";

const reply = (id: string, ...types: ("text" | "changes" | "hold")[]): Message => ({
  id,
  role: "agent",
  agentId: "a1",
  at: 1,
  blocks: types.map((type) =>
    type === "text" ? { type, text: "done" } : ({ type, agentId: "a1" } as const),
  ),
});

describe("withoutStaleCards", () => {
  it("keeps the cards of the latest reply and drops them from earlier ones", () => {
    const messages = [reply("a", "text", "changes"), reply("b", "text", "changes", "hold")];
    const [first, last] = withoutStaleCards(messages);
    expect(first).toMatchObject({ blocks: [{ type: "text" }] });
    expect(last).toBe(messages[1]);
  });

  it("drops an earlier reply that was nothing but cards", () => {
    const messages = [reply("a", "changes"), reply("b", "text")];
    expect(withoutStaleCards(messages)).toEqual([messages[1]]);
  });

  it("returns the same messages when nothing is stale", () => {
    const messages = [reply("a", "text"), reply("b", "text", "changes")];
    expect(withoutStaleCards(messages)).toEqual(messages);
  });
});
