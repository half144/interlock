import { useRef } from "react";
import type { Agent, Subagent } from "@/types";
import { agentLabel } from "@/lib/agentKinds";
import { Dock } from "@/components/ui/Dock/Dock";
import { useFollowScroll } from "@/features/subagents/hooks/useFollowScroll";
import { ChatHeader } from "./ChatHeader/ChatHeader";
import { SubagentComposer } from "./SubagentComposer/SubagentComposer";
import { SubagentTranscript } from "./SubagentTranscript/SubagentTranscript";

/** A subagent as a chat of its own: the brief, every call it made with what it saw, what it returned, and a composer to talk to it. */
export function SubagentChat({ sub, agent }: { sub: Subagent; agent: Agent }) {
  const parent = agentLabel(agent);
  const scroller = useRef<HTMLDivElement>(null);
  useFollowScroll(scroller, `${sub.events.length}:${sub.status}`);

  return (
    <>
      <ChatHeader sub={sub} parent={parent} />
      <div ref={scroller} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex-1 px-5 pt-5">
          <SubagentTranscript sub={sub} agent={agent} parent={parent} />
        </div>
        <Dock surface="raised" className="px-4 pb-4">
          <SubagentComposer sub={sub} parentLabel={parent} />
        </Dock>
      </div>
    </>
  );
}
