import type { FileDiff } from "@/types";
import type { SliceCreator } from "../types";

export interface EditorTab {
  path: string;
  /** Opened with a single click: shown in italics and replaced by the next file you open, as in VS Code. */
  preview: boolean;
}

export interface EditorState {
  tabs: EditorTab[];
  active: string | null;
}

export interface EditorSlice {
  /** The review editor of each agent's worktree, by agent id. */
  editors: Record<string, EditorState>;

  openFile: (agentId: string, path: string, pin?: boolean) => void;
  closeFile: (agentId: string, path: string) => void;
}

/** Until you touch it, the review shows the first changed file in a preview tab. */
export function editorOf(
  editors: Record<string, EditorState>,
  agentId: string,
  files: FileDiff[] = [],
): EditorState {
  const first = files[0]?.path ?? null;
  return editors[agentId] ?? { tabs: first ? [{ path: first, preview: true }] : [], active: first };
}

/** A file already open just becomes active (and pinned, if asked); a new one takes over the preview tab. */
function withFile(editor: EditorState, path: string, pin: boolean): EditorState {
  const open = editor.tabs.some((t) => t.path === path);
  const preview = editor.tabs.findIndex((t) => t.preview);
  const tab = { path, preview: !pin };
  const tabs = open
    ? editor.tabs.map((t) => (t.path === path && pin ? tab : t))
    : !pin && preview >= 0
      ? editor.tabs.with(preview, tab)
      : [...editor.tabs, tab];
  return { tabs, active: path };
}

export const createEditorSlice: SliceCreator<EditorSlice> = (set) => {
  const update = (agentId: string, next: (editor: EditorState) => EditorState) =>
    set((s) => ({
      editors: { ...s.editors, [agentId]: next(editorOf(s.editors, agentId, s.diffs[agentId])) },
    }));

  return {
    editors: {},

    openFile: (agentId, path, pin = false) => update(agentId, (e) => withFile(e, path, pin)),

    closeFile: (agentId, path) =>
      update(agentId, (e) => {
        const at = e.tabs.findIndex((t) => t.path === path);
        const tabs = e.tabs.filter((t) => t.path !== path);
        return {
          tabs,
          active:
            e.active === path ? (tabs[Math.min(at, tabs.length - 1)]?.path ?? null) : e.active,
        };
      }),
  };
};
