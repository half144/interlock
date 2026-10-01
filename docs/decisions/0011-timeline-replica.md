# 0011 — How the app replicates an agent timeline

- **Context:** Paseo's app keeps a durable per-host timeline cache with selective subscriptions and gap recovery (`docs/timeline-sync.md`). Interlock has one local daemon and shows one task at a time.
- **Decision:** only the open task is replicated. `daemon/sync/timeline.ts` fetches one bounded projected tail (200 items), remembers `window.maxSeq` and the epoch, then applies live `agent_stream` timeline rows in order, batched per animation frame. A sequence gap, a changed epoch or `agent.timeline.replacement` fetches the tail again. Live rows that arrive before the tail are buffered and applied if newer than it. There is no on-disk cache and no older-history paging yet.
- **Why:** the daemon is on the same machine, so a tail fetch is cheap and the cache and its invalidation rules buy little. Everything protocol-shaped stays in `daemon/adapters/`; the reducer (`applyTimelineItem`) is shared by the history and live paths.
- **Consequences:** reopening a task refetches its tail. Tasks that are not open only have their agent snapshot (status, hold, title). Paging older history is a W3 item for the conversation group.
