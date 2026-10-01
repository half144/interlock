import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import { useStore } from "@/stores/app-store";

export const listenAccounts = (client: DaemonClient): (() => void) =>
  client.onProviderAuthCompleted((result) => useStore.getState().completeLogin(result));
