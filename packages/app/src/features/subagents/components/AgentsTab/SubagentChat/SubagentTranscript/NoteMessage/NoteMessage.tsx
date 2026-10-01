import type { SubagentEvent } from "@/types";
import { Findings } from "@/features/subagents/components/chat/Findings/Findings";

export function NoteMessage({ event }: { event: SubagentEvent }) {
  return (
    <div>
      <p className="text-[15px] leading-[1.65] text-ink [text-wrap:pretty]">{event.text}</p>
      {event.body && event.body.length > 0 && <Findings items={event.body} />}
    </div>
  );
}
