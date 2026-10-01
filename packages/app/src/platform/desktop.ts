import { browserBridge } from "./browserBridge";
import { tauriBridge } from "./tauriBridge";

export const isDesktop = "__TAURI_INTERNALS__" in globalThis;

const bridge = isDesktop ? tauriBridge : browserBridge;

export const getDaemonConnection = bridge.getDaemonConnection;
export const onDaemonStatus = bridge.onDaemonStatus;
export const pickFolder = bridge.pickFolder;
export const notify = bridge.notify;
export const setActivity = bridge.setActivity;
export const setFocusedTask = bridge.setFocusedTask;
export const onOpenTask = bridge.onOpenTask;
export type { Activity, DaemonConnection, DaemonStatus, Notice } from "./types";
