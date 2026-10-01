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
    expect(transcriptSize([agent("hel")])).toBeLessThan(transcriptSize([agent("hello")]));
    expect(transcriptSize([agent("hello")])).toBeLessThan(
      transcriptSize([agent("hello"), { id: "u", role: "user", text: "", at: 0 }]),
    );
  });
});
