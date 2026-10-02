import { browserBridge } from "./browserBridge";
import { tauriBridge } from "./tauriBridge";

const isDesktop = "__TAURI_INTERNALS__" in globalThis;

const bridge = isDesktop ? tauriBridge : browserBridge;

/** In the desktop app on a Mac the title bar is transparent and the window buttons sit inside our own top bar. */
export const macChrome = isDesktop && navigator.userAgent.includes("Macintosh");

export const getDaemonConnection = bridge.getDaemonConnection;
export const onDaemonStatus = bridge.onDaemonStatus;
export const pickFolder = bridge.pickFolder;
export const openExternal = bridge.openExternal;
export const notify = bridge.notify;
export const setActivity = bridge.setActivity;
export const setFocusedTask = bridge.setFocusedTask;
export const onOpenTask = bridge.onOpenTask;
export const onDragDrop = bridge.onDragDrop;
export type { Activity, DaemonConnection, Notice } from "./types";
