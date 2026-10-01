import { AnimatePresence, motion } from "motion/react";
import type { Agent, Subagent } from "@/types";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";
import { AgentMark } from "@/components/ui/AgentMark/AgentMark";
import { surface } from "@/lib/styles";
import { AskedBubble } from "./AskedBubble/AskedBubble";
import { CallGroup } from "./CallGroup/CallGroup";
import { LiveView } from "./LiveView/LiveView";
import { NoteMessage } from "./NoteMessage/NoteMessage";
import { ResultCard } from "./ResultCard/ResultCard";
import { SpeakerLine } from "./SpeakerLine/SpeakerLine";
import { useSubagentTranscript } from "./useSubagentTranscript";

/** The subagent's own chat: the brief it was handed, every call it made, and what it sent back. */
export function SubagentTranscript({
  sub,
  agent,
  parent,
}: {
  sub: Subagent;
  agent: Agent;
  parent: string;
}) {
  const { entries, isFresh } = useSubagentTranscript(sub);

  return (
    <div className="relative flex flex-col gap-4">
      <AskedBubble
        by={
          <>
            <AgentMark kind={agent.kind} /> {parent} · brief
          </>
        }
        text={sub.brief}
      />

      {entries.map((entry, i) => (
        <motion.div
          key={i}
          initial={
            isFresh(entry.kind === "calls" ? entry.calls[0] : entry.event)
              ? { opacity: 0, y: 6 }
              : false
          }
          animate={{ opacity: 1, y: 0 }}
          transition={fadeIn}
          className="flex flex-col gap-2"
        >
          {(i === 0 || entries[i - 1]?.kind === "you") && entry.kind !== "you" && (
            <SpeakerLine sub={sub} />
          )}
          {entry.kind === "calls" && (
            <CallGroup
              calls={entry.calls}
              startSec={sub.startSec}
              live={sub.status === "running" && i === entries.length - 1}
              isFresh={isFresh}
            />
          )}
          {entry.kind === "you" && <AskedBubble by="You" text={entry.event.text} />}
          {entry.kind === "note" && <NoteMessage event={entry.event} />}
        </motion.div>
      ))}

      {/* The live view hands over to the result: the moment the subagent reports back. */}
      <AnimatePresence mode="popLayout" initial={false}>
        {sub.status === "running" ? (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: fadeIn }}
            exit={{ opacity: 0, transition: fadeOut }}
          >
            <LiveView sub={sub} />
          </motion.div>
        ) : sub.result ? (
          <motion.section
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: fadeIn }}
            exit={{ opacity: 0, transition: fadeOut }}
            className={cn(surface.card, "p-4")}
          >
            <ResultCard sub={sub} agent={agent} parent={parent} />
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
