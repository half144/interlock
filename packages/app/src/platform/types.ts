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

export type Unsubscribe = () => void;
