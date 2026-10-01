import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import { useStore } from "@/stores/app-store";
import type { Subagent } from "@/types";
import {
  appendSubagentEvent,
  finishSubagent,
  toSubagent,
  toSubagentEvent,
  type ProviderSubagentDescriptorPayload,
} from "../adapters/subagents";

const originOf = (agentId: string) => useStore.getState().agents[agentId]?.createdAt;

async function withHistory(
  client: DaemonClient,
  descriptor: ProviderSubagentDescriptorPayload,
  origin: number,
): Promise<Subagent> {
  const page = await client.fetchProviderSubagentTimeline(descriptor.parentAgentId, descriptor.id, {
    direction: "tail",
    limit: 100,
  });
  const base = toSubagent(descriptor, origin);
  const events = page.rows.flatMap((r) => toSubagentEvent(r.item, r.timestamp, origin) ?? []);
  const sub = events.reduce(appendSubagentEvent, base);
  return sub.status === "done" ? finishSubagent(sub) : sub;
}

/** Loads the subagents of the open task with their history. */
export async function loadSubagents(client: DaemonClient, agentId: string): Promise<void> {
  const origin = originOf(agentId);
  if (origin === undefined) return;
  const list = await client.listProviderSubagents(agentId);
  const subagents = await Promise.all(list.subagents.map((d) => withHistory(client, d, origin)));
  useStore.getState().replaceSubagents(agentId, subagents);
}

/** Applies subagent pushes for any task; the daemon only sends them for tasks it is streaming. */
export function listenSubagents(client: DaemonClient): () => void {
  return client.on("agent.provider_subagents.update", ({ payload }) => {
    const store = useStore.getState();
    if (payload.kind === "remove") {
      store.removeSubagent(payload.subagentId);
      return;
    }
    if (payload.kind === "upsert") {
      const origin = originOf(payload.subagent.parentAgentId);
      if (origin === undefined) return;
      const fresh = toSubagent(payload.subagent, origin);
      const known = store.subagents[fresh.id];
      const next = { ...fresh, events: known?.events ?? [] };
      store.upsertSubagent(fresh.status === "done" ? finishSubagent(next) : next);
      return;
    }
    const origin = originOf(payload.parentAgentId);
    const event =
      origin === undefined ? null : toSubagentEvent(payload.item, payload.timestamp, origin);
    if (event) store.editSubagent(payload.subagentId, (sub) => appendSubagentEvent(sub, event));
  });
}
