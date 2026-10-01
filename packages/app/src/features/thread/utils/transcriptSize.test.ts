import { describe, expect, it } from "vitest";
import type { Message } from "@/types";
import { transcriptSize } from "./transcriptSize";

const agent = (text: string): Message => ({
  id: "a",
  role: "agent",
  blocks: [
    { type: "text", text },
    { type: "hold", agentId: "x" },
  ],
  at: 0,
});

describe("transcriptSize", () => {
  it("grows with the streaming reply and with each new message", () => {
    expect(transcriptSize([agent("hel")], false)).toBeLessThan(
      transcriptSize([agent("hello")], false),
    );
    expect(transcriptSize([agent("hello")], false)).toBeLessThan(
      transcriptSize([agent("hello"), { id: "u", role: "user", text: "", at: 0 }], false),
    );
  });

  it("changes when the thinking line comes or goes, even as a block lands in the same update", () => {
    expect(transcriptSize([agent("hi")], true)).not.toBe(transcriptSize([agent("hi")], false));
    expect(transcriptSize([agent("hi")], true)).not.toBe(transcriptSize([agent("hi!")], false));
  });
});
