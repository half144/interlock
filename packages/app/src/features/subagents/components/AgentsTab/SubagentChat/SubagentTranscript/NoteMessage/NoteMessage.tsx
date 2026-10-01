import type { SubagentEvent } from "@/types";

export function NoteMessage({ event }: { event: SubagentEvent }) {
  return <p className="text-[15px] leading-[1.65] text-ink [text-wrap:pretty]">{event.text}</p>;
}
