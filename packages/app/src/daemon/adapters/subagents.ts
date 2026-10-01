import type { AgentTimelineItem } from "@interlock/protocol/agent-types";
import type { SessionOutboundMessage } from "@interlock/protocol/messages";
import type { Subagent, SubagentEvent, SubagentStatus } from "@/types";
import { toolNameOf } from "./tools";

type SubagentUpdate = Extract<SessionOutboundMessage, { type: "agent.provider_subagents.update" }>;
export type ProviderSubagentDescriptorPayload = Extract<
  SubagentUpdate["payload"],
  { kind: "upsert" }
>["subagent"];

const STATUS: Record<ProviderSubagentDescriptorPayload["status"], SubagentStatus> = {
  running: "running",
  completed: "done",
  failed: "failed",
  canceled: "stopped",
};

const EXCERPT_LINES = 12;

const secondsSince = (timestamp: string, origin: number) =>
  Math.max(0, Math.round((Date.parse(timestamp) - origin) / 1000));

const excerpt = (output: string | undefined) =>
  output ? output.split("\n").slice(0, EXCERPT_LINES) : undefined;

export function toSubagent(
  descriptor: ProviderSubagentDescriptorPayload,
  parentCreatedAt: number,
): Subagent {
  const status = STATUS[descriptor.status];
  return {
    id: descriptor.id,
    parentId: descriptor.parentAgentId,
    toolCallId: descriptor.toolCallId,
    name: descriptor.title ?? descriptor.description ?? "Subagent",
    brief: descriptor.description ?? "",
    subtitle: descriptor.subtitle ?? null,
    status,
    startSec: secondsSince(descriptor.createdAt, parentCreatedAt),
    ...(status === "running"
      ? {}
      : { endSec: secondsSince(descriptor.updatedAt, parentCreatedAt) }),
    events: [],
  };
}

type ToolItem = Extract<AgentTimelineItem, { type: "tool_call" }>;
type Detail<T extends ToolItem["detail"]["type"]> = Extract<ToolItem["detail"], { type: T }>;

function shellEvent(detail: Detail<"shell">): Omit<SubagentEvent, "kind" | "sec"> {
  const body = excerpt(detail.output);
  return {
    text: detail.command,
    ...(detail.exitCode == null ? {} : { meta: `exit ${detail.exitCode}` }),
    ...(body ? { body } : {}),
  };
}

function readEvent(detail: Detail<"read">): Omit<SubagentEvent, "kind" | "sec"> {
  const body = excerpt(detail.content);
  return {
    text: detail.filePath,
    ...(body ? { body, meta: `${detail.content?.split("\n").length ?? 0} lines` } : {}),
    ...(detail.offset === undefined ? {} : { from: detail.offset + 1 }),
  };
}

function searchEvent(detail: Detail<"search">): Omit<SubagentEvent, "kind" | "sec"> {
  const count = detail.numMatches ?? detail.numFiles ?? detail.filePaths?.length;
  const body = detail.filePaths?.slice(0, EXCERPT_LINES) ?? excerpt(detail.content);
  return {
    text: detail.query,
    ...(count === undefined ? {} : { meta: `${count} ${count === 1 ? "result" : "results"}` }),
    ...(body ? { body } : {}),
  };
}

function toolFacts(item: ToolItem): Omit<SubagentEvent, "kind" | "sec"> {
  const { detail } = item;
  if (detail.type === "shell") return shellEvent(detail);
  if (detail.type === "read") return readEvent(detail);
  if (detail.type === "search") return searchEvent(detail);
  if (detail.type === "edit" || detail.type === "write") return { text: detail.filePath };
  if (detail.type === "fetch") return { text: detail.url };
  return { text: item.name };
}

const toolEvent = (item: ToolItem, sec: number): SubagentEvent => ({
  kind: toolNameOf(item),
  sec,
  ...toolFacts(item),
});

export function toSubagentEvent(
  item: AgentTimelineItem,
  timestamp: string,
  parentCreatedAt: number,
): SubagentEvent | null {
  const sec = secondsSince(timestamp, parentCreatedAt);
  if (item.type === "assistant_message") return { kind: "note", text: item.text, sec };
  if (item.type === "tool_call") return toolEvent(item, sec);
  return null;
}

export function appendSubagentEvent(sub: Subagent, event: SubagentEvent): Subagent {
  const last = sub.events.at(-1);
  if (last?.kind === "note" && event.kind === "note") {
    return {
      ...sub,
      events: [...sub.events.slice(0, -1), { ...last, text: last.text + event.text }],
    };
  }
  return { ...sub, events: [...sub.events, event] };
}

export function finishSubagent(sub: Subagent): Subagent {
  const note = sub.events.findLast((e) => e.kind === "note");
  return note ? { ...sub, result: note.text } : sub;
}
