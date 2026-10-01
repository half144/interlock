import { DaemonClient } from "@interlock/client/internal/daemon-client";
import type { DaemonConnection } from "@/platform/desktop";

// The daemon is on loopback, so retries are cheap and a stalled handshake is a failure, not latency.
const RECONNECT = { enabled: true, baseDelayMs: 250, maxDelayMs: 2_000 };
const CONNECT_TIMEOUT_MS = 3_000;

const clientId = crypto.randomUUID();

let current: { client: DaemonClient; key: string } | null = null;

/** Opens the one client of this window, reusing it while the connection info is unchanged. */
export function openClient({ url, token }: DaemonConnection): DaemonClient {
  const key = `${url}\n${token}`;
  if (current?.key === key) return current.client;
  void current?.client.close();
  const client = new DaemonClient({
    url,
    clientId,
    clientType: "browser",
    password: token,
    suppressSendErrors: true,
    reconnect: RECONNECT,
    connectTimeoutMs: CONNECT_TIMEOUT_MS,
  });
  current = { client, key };
  return client;
}

export const currentClient = (): DaemonClient | undefined => current?.client;

export function getClient(): DaemonClient {
  if (!current)
    throw new Error("The daemon is not connected yet. Wait for the connection, then retry.");
  return current.client;
}

export async function closeClient(): Promise<void> {
  const open = current;
  current = null;
  await open?.client.close();
}
