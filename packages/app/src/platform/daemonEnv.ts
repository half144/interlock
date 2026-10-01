import type { DaemonConnection } from "./types";

export function connectionFromEnv(env: Record<string, unknown>): DaemonConnection {
  const url = env["VITE_DAEMON_URL"];
  const token = env["VITE_DAEMON_TOKEN"];
  if (typeof url !== "string" || url === "" || typeof token !== "string" || token === "") {
    throw new Error(
      "No daemon connection: set VITE_DAEMON_URL and VITE_DAEMON_TOKEN (e.g. in packages/app/.env.local) or run inside the desktop app.",
    );
  }
  return { url, token };
}
