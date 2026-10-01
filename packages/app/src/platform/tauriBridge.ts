import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { Bridge } from "./bridge";
import type { DaemonStatus, Unsubscribe } from "./types";

const DAEMON_STATUS_EVENT = "daemon://status";
const OPEN_TASK_EVENT = "app://open-task";

function unsubscribe(pending: Promise<UnlistenFn>): Unsubscribe {
  return () => {
    void pending.then((unlisten) => unlisten());
  };
}

export const tauriBridge: Bridge = {
  getDaemonConnection: () => invoke("daemon_connection"),
  onDaemonStatus: (callback) =>
    unsubscribe(listen<DaemonStatus>(DAEMON_STATUS_EVENT, (e) => callback(e.payload))),
  pickFolder: () => invoke("pick_folder"),
  openExternal: (url) => invoke("plugin:shell|open", { path: url }),
  notify: (notice) => invoke("notify", { ...notice }),
  setActivity: (activity) => invoke("set_activity", { ...activity }),
  setFocusedTask: (taskId) => invoke("set_focus", { taskId }),
  onOpenTask: (callback) =>
    unsubscribe(listen<string>(OPEN_TASK_EVENT, (e) => callback(e.payload))),
};
