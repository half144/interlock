import type { FileDiff } from "@/types";
import { diffs } from "@/mocks/diffs";
import { useStore } from "@/stores/app-store";
import { editorOf } from "@/stores/slices/editor";

const NO_FILES: FileDiff[] = [];

/** An agent's worktree under review: the files it changed, and the tabs open on them. */
export function useReview(agentId: string) {
  const editors = useStore((s) => s.editors);
  return { files: diffs[agentId] ?? NO_FILES, editor: editorOf(editors, agentId) };
}
