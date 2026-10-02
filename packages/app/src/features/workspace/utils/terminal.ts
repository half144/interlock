export type Pane = "setup" | "shell";

export const PANES: [Pane, string][] = [
  ["setup", "setup"],
  ["shell", "shell"],
];

/** The home folder as `~`, so a worktree path reads short in the pane header. */
export const homeRelative = (path: string) => path.replace(/^\/(?:Users|home)\/[^/]+/, "~");

/** `starting`: connected, and the shell has not printed anything yet (a slow profile can take seconds). */
export type ShellStatus =
  | { name: "connecting" | "starting" | "ready" | "exited" }
  | { name: "failed"; message: string };
