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
  // The shell may emit `ready` before this window subscribes (launch, reload), so the current
  // status is read once too; an event that lands first wins over that read.
  onDaemonStatus: (callback) => {
    let heard = false;
    const off = unsubscribe(
      listen<DaemonStatus>(DAEMON_STATUS_EVENT, (e) => {
        heard = true;
        callback(e.payload);
      }),
    );
    void invoke<DaemonStatus>("daemon_status").then((status) => {
      if (!heard) callback(status);
    });
    return off;
  },
  pickFolder: () => invoke("pick_folder"),
  openExternal: (url) => invoke("plugin:shell|open", { path: url }),
  notify: (notice) => invoke("notify", { ...notice }),
  setActivity: (activity) => invoke("set_activity", { ...activity }),
  setFocusedTask: (taskId) => invoke("set_focus", { taskId }),
  onOpenTask: (callback) =>
    unsubscribe(listen<string>(OPEN_TASK_EVENT, (e) => callback(e.payload))),
};
