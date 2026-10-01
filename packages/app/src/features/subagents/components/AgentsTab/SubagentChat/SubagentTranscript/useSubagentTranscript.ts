import type { Subagent } from "@/types";
import { useFresh } from "@/features/subagents/hooks/useFresh";
import { toEntries } from "@/features/subagents/utils/entries";

export function useSubagentTranscript(sub: Subagent) {
  return { entries: toEntries(sub.events), isFresh: useFresh(sub.events) };
}
