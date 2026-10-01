export type Pane = "setup" | "shell";

export const PANES: [Pane, string][] = [
  ["setup", "setup"],
  ["shell", "shell"],
];

/** The home folder as `~`, so a worktree path reads short in the pane header. */
export const homeRelative = (path: string) => path.replace(/^\/(?:Users|home)\/[^/]+/, "~");

export type ShellStatus =
  | { name: "connecting" | "ready" | "exited" }
  | { name: "failed"; message: string };
