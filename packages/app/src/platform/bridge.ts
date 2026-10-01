import type { Activity, DaemonConnection, DaemonStatus, Notice, Unsubscribe } from "./types";

export interface Bridge {
  getDaemonConnection: () => Promise<DaemonConnection>;
  onDaemonStatus: (callback: (status: DaemonStatus) => void) => Unsubscribe;
  pickFolder: () => Promise<string | null>;
  openExternal: (url: string) => Promise<void>;
  notify: (notice: Notice) => Promise<void>;
  setActivity: (activity: Activity) => Promise<void>;
  setFocusedTask: (taskId: string | null) => Promise<void>;
  onOpenTask: (callback: (taskId: string) => void) => Unsubscribe;
}
