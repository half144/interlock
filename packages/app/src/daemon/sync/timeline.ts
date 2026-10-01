import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import type { SessionOutboundMessage } from "@interlock/protocol/messages";
import { useStore } from "@/stores/app-store";
import type { Message } from "@/types";
import {
  applyTimelineItem,
  buildMessages,
  withTrailingBlocks,
  type TimelineInput,
} from "../adapters/timeline";

const TAIL = 200;

type StreamMessage = Extract<SessionOutboundMessage, { type: "agent_stream" }>;

interface Live extends TimelineInput {
  seq: number;
  epoch: string | undefined;
}

function liveItem(message: StreamMessage): Live | null {
  const { event, seq, epoch, timestamp } = message.payload;
  if (event.type !== "timeline" || seq === undefined) return null;
  return { item: event.item, timestamp, seq, epoch };
}

/**
 * Keeps the open task's conversation in the store: one bounded tail from the daemon, then every live row
 * after it in order. A gap or a new epoch fetches the tail again. Rows arriving in a burst reach the store
 * once per frame.
 */
export function watchTimeline(client: DaemonClient, agentId: string): () => void {
  let disposed = false;
  let ready = false;
  let epoch: string | null = null;
  let lastSeq = -1;
  let buffer: Live[] = [];
  let queued: TimelineInput[] = [];
  let frame = 0;

  const edit = (change: (messages: Message[]) => Message[]) => {
    useStore.getState().editMessages(agentId, (messages) => {
      const next = change(messages);
      const agent = useStore.getState().agents[agentId];
      return withTrailingBlocks(next, agentId, {
        hold: agent?.hold !== undefined,
        changes: agent?.aspect === "review" || agent?.aspect === "merged",
      });
    });
  };

  const flush = () => {
    frame = 0;
    const items = queued;
    queued = [];
    edit((messages) =>
      items.reduce((all, input) => applyTimelineItem(all, input, agentId), messages),
    );
  };

  const enqueue = (live: Live) => {
    lastSeq = live.seq;
    queued.push(live);
    frame ||= requestAnimationFrame(flush);
  };

  const resync = async () => {
    ready = false;
    try {
      const page = await client.fetchAgentTimeline(agentId, {
        direction: "tail",
        limit: TAIL,
        projection: "projected",
      });
      if (disposed) return;
      epoch = page.epoch;
      lastSeq = page.window.maxSeq;
      queued = [];
      edit(() => buildMessages(page.entries, agentId));
      ready = true;
      const pending = buffer;
      buffer = [];
      pending.filter((l) => l.seq > lastSeq).forEach(onLive);
    } catch (error) {
      if (!disposed) useStore.getState().reportError(error);
    }
  };

  function onLive(live: Live) {
    if (!ready) {
      buffer.push(live);
    } else if (live.epoch !== epoch || live.seq > lastSeq + 1) {
      buffer = [live];
      void resync();
    } else if (live.seq > lastSeq) {
      enqueue(live);
    }
  }

  const subscription = client.subscribeAgentTimeline(agentId, (message) => {
    if (message.type === "agent.timeline.replacement") {
      void resync();
      return;
    }
    const live = liveItem(message);
    if (live) onLive(live);
  });
  void resync();

  return () => {
    disposed = true;
    subscription();
    if (frame) cancelAnimationFrame(frame);
  };
}
