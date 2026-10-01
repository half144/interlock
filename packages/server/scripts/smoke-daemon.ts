import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { WebSocket } from "ws";
import { fileURLToPath } from "node:url";
import { DaemonClient } from "../src/server/test-utils/daemon-client.js";

const LISTEN = "127.0.0.1:6868";
const token = randomBytes(32).toString("hex");
const root = mkdtempSync(path.join(tmpdir(), "interlock-smoke-"));
const home = path.join(root, "home");
const interlockHome = path.join(root, "interlock");
const entry = fileURLToPath(new URL("./supervisor-entrypoint.ts", import.meta.url));

const daemon = spawn(process.execPath, ["--import", "tsx", entry, "--dev"], {
  env: {
    ...process.env,
    HOME: home,
    INTERLOCK_HOME: interlockHome,
    INTERLOCK_LISTEN: LISTEN,
    INTERLOCK_TOKEN: token,
  },
  stdio: "ignore",
});

async function connect(password: string | undefined): Promise<DaemonClient> {
  const client = new DaemonClient({
    url: `ws://${LISTEN}/ws`,
    password,
    connectTimeoutMs: 3000,
    reconnect: { enabled: false },
  });
  await client.connect();
  return client;
}

async function waitForAccepted(): Promise<DaemonClient> {
  const deadline = Date.now() + 60_000;
  for (;;) {
    try {
      return await connect(token);
    } catch (error) {
      if (Date.now() > deadline) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

async function main(): Promise<void> {
  const client = await waitForAccepted();
  const info = client.getLastServerInfoMessage();
  if (!info) throw new Error("handshake produced no server_info");
  console.log(`handshake ok: serverId=${info.serverId} version=${info.version ?? "?"}`);
  await client.close();

  const closeCode = await new Promise<number>((resolve, reject) => {
    const ws = new WebSocket(`ws://${LISTEN}/ws`);
    ws.on("message", () => reject(new Error("daemon sent data to a connection without token")));
    ws.on("close", resolve);
    ws.on("error", () => resolve(-1));
  });
  if (closeCode === 1000) throw new Error("connection without token closed normally");
  console.log(`connection without token rejected (close code ${closeCode})`);

  if (readdirSync(interlockHome).length === 0) throw new Error("INTERLOCK_HOME is empty");
  let homeEntries: string[] = [];
  try {
    homeEntries = readdirSync(home);
  } catch {
    // never created: nothing was written to HOME
  }
  if (homeEntries.length > 0) throw new Error(`daemon wrote to HOME: ${homeEntries.join(", ")}`);
  console.log("HOME untouched, state under INTERLOCK_HOME");
}

try {
  await main();
} finally {
  daemon.kill("SIGTERM");
  await new Promise((resolve) => setTimeout(resolve, 1500));
  rmSync(root, { recursive: true, force: true });
}
process.exit(0);
