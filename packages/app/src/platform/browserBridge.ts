import { connectionFromEnv } from "./daemonEnv";
import type { Bridge } from "./bridge";
import { showWebNotification } from "./webNotification";

const openTaskListeners = new Set<(taskId: string) => void>();

export const browserBridge: Bridge = {
  getDaemonConnection: () => Promise.resolve(connectionFromEnv(import.meta.env)),
  onDaemonStatus: () => () => undefined,
  pickFolder: () => Promise.resolve(null),
  notify: (notice) => {
    showWebNotification(notice, (taskId) => {
      openTaskListeners.forEach((listener) => listener(taskId));
    });
    return Promise.resolve();
  },
  setActivity: () => Promise.resolve(),
  setFocusedTask: () => Promise.resolve(),
  onOpenTask: (callback) => {
    openTaskListeners.add(callback);
    return () => openTaskListeners.delete(callback);
  },
};
