import { DaemonClient } from "@interlock/client/internal/daemon-client";
import type { DaemonConnection } from "@/platform/desktop";

const RECONNECT = { enabled: true, baseDelayMs: 500, maxDelayMs: 10_000 };

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
  });
  current = { client, key };
  return client;
}

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
