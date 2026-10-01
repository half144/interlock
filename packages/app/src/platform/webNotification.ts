import type { Notice } from "./types";

export type NotificationPermissionState = "default" | "denied" | "granted";

export function shouldRequestPermission(state: NotificationPermissionState): boolean {
  return state === "default";
}

export function canShow(state: NotificationPermissionState): boolean {
  return state === "granted";
}

export function showWebNotification(notice: Notice, onClick: (taskId: string) => void): void {
  if (typeof Notification === "undefined") return;
  const show = () => {
    const shown = new Notification(notice.title, { body: notice.body, tag: notice.taskId });
    shown.onclick = () => {
      window.focus();
      onClick(notice.taskId);
    };
  };
  if (canShow(Notification.permission)) {
    show();
  } else if (shouldRequestPermission(Notification.permission)) {
    void Notification.requestPermission().then((state) => {
      if (canShow(state)) show();
    });
  }
}
