export type DaemonStatus = "starting" | "ready" | "crashed";

export interface DaemonConnection {
  url: string;
  token: string;
}

export interface Activity {
  running: number;
  waiting: number;
}

export interface Notice {
  title: string;
  body: string;
  taskId: string;
}

/** Files or folders dragged from Finder over the window, with the paths they carry. */
export type DragDrop = { phase: "enter" | "drop"; paths: string[] } | { phase: "leave" };

export type Unsubscribe = () => void;
