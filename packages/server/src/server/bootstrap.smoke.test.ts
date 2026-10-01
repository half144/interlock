import os from "node:os";
import path from "node:path";
import { access, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

import { parseListenString } from "./bootstrap.js";
import { createTestPaseoDaemon } from "./test-utils/paseo-daemon.js";

describe("interlock daemon bootstrap", () => {
  test("starts and serves health endpoint", async () => {
    const daemonHandle = await createTestPaseoDaemon();
    try {
      const response = await fetch(`http://127.0.0.1:${daemonHandle.port}/api/health`);
      expect(response.ok).toBe(true);
      const payload = (await response.json()) as { status: string; timestamp: unknown };
      expect(payload.status).toBe("ok");
      expect(typeof payload.timestamp).toBe("string");
    } finally {
      await daemonHandle.close();
    }
  });

  test("keeps timeline activity in memory and removes obsolete timeline files at startup", async () => {
    const paseoHomeRoot = await mkdtemp(path.join(os.tmpdir(), "interlock-timeline-cleanup-"));
    const paseoHome = path.join(paseoHomeRoot, ".interlock");
    const obsoleteTimelineDirectory = path.join(paseoHome, "agent-timelines");
    const agentCwd = await mkdtemp(path.join(os.tmpdir(), "interlock-timeline-agent-"));
    await mkdir(obsoleteTimelineDirectory, { recursive: true });
    await writeFile(path.join(obsoleteTimelineDirectory, "obsolete.json"), "{}\n", "utf-8");

    const daemonHandle = await createTestPaseoDaemon({ paseoHomeRoot, cleanup: false });
    try {
      await expect(access(obsoleteTimelineDirectory)).rejects.toMatchObject({ code: "ENOENT" });

      const agent = await daemonHandle.daemon.agentManager.createAgent(
        { provider: "codex", cwd: agentCwd },
        undefined,
        { workspaceId: undefined },
      );
      await daemonHandle.daemon.agentManager.appendTimelineItem(agent.id, {
        type: "assistant_message",
        text: "timeline stays in memory",
      });
      await daemonHandle.daemon.agentManager.flush();

      await expect(access(obsoleteTimelineDirectory)).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await daemonHandle.close();
      await Promise.all([
        rm(paseoHomeRoot, { recursive: true, force: true }),
        rm(agentCwd, { recursive: true, force: true }),
      ]);
    }
  });

  test("does not create a timeline directory for live timeline activity", async () => {
    const paseoHomeRoot = await mkdtemp(path.join(os.tmpdir(), "interlock-timeline-memory-"));
    const agentCwd = await mkdtemp(path.join(os.tmpdir(), "interlock-timeline-agent-"));
    const daemonHandle = await createTestPaseoDaemon({ paseoHomeRoot, cleanup: false });
    const timelineDirectory = path.join(daemonHandle.paseoHome, "agent-timelines");
    try {
      const agent = await daemonHandle.daemon.agentManager.createAgent(
        { provider: "codex", cwd: agentCwd },
        undefined,
        { workspaceId: undefined },
      );
      await daemonHandle.daemon.agentManager.appendTimelineItem(agent.id, {
        type: "assistant_message",
        text: "timeline stays in memory",
      });
      await daemonHandle.daemon.agentManager.flush();

      await expect(access(timelineDirectory)).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await daemonHandle.close();
      await Promise.all([
        rm(paseoHomeRoot, { recursive: true, force: true }),
        rm(agentCwd, { recursive: true, force: true }),
      ]);
    }
  });

  test("answers CORS preflight for the Tauri origin and rejects unknown hosts", async () => {
    const daemonHandle = await createTestPaseoDaemon();
    try {
      const preflight = await fetch(`http://127.0.0.1:${daemonHandle.port}/api/health`, {
        method: "OPTIONS",
        headers: { Origin: "tauri://localhost" },
      });
      expect(preflight.status).toBe(204);
      expect(preflight.headers.get("access-control-allow-origin")).toBe("tauri://localhost");
    } finally {
      await daemonHandle.close();
    }
  });

  test("does not serve a web UI or agent MCP endpoint", async () => {
    const daemonHandle = await createTestPaseoDaemon();
    try {
      for (const route of ["/", "/mcp/agents", "/api/terminal-activity"]) {
        const response = await fetch(`http://127.0.0.1:${daemonHandle.port}${route}`, {
          method: "POST",
        });
        expect(response.status).toBe(404);
      }
    } finally {
      await daemonHandle.close();
    }
  });

  test("parses whitespace-padded numeric port strings", () => {
    expect(parseListenString(" 6767 ")).toEqual({
      type: "tcp",
      host: "127.0.0.1",
      port: 6767,
    });
  });

  test("parses IPv6 listen targets correctly", () => {
    expect(parseListenString("[::1]:6767")).toEqual({
      type: "tcp",
      host: "::1",
      port: 6767,
    });
    expect(parseListenString("[::]:6767")).toEqual({
      type: "tcp",
      host: "::",
      port: 6767,
    });
  });

  test("rejects Windows absolute paths that are not named pipes", () => {
    // A Windows drive path like C:\daemon must NOT be silently parsed as TCP
    // (split(":") would yield host="C" and port="\\daemon" which is nonsensical).
    expect(() => parseListenString(String.raw`C:\daemon`)).toThrow();
    expect(() => parseListenString(String.raw`D:\Users\foo\.paseo\daemon.sock`)).toThrow();
    // Single-letter "host" with no valid port is not a valid listen string
    expect(() => parseListenString(String.raw`C:\some\path`)).toThrow();
  });

  test("parses Windows named pipes as managed IPC listen targets", () => {
    expect(parseListenString(String.raw`\\.\pipe\paseo-managed-test`)).toEqual({
      type: "pipe",
      path: String.raw`\\.\pipe\paseo-managed-test`,
    });
    expect(parseListenString(`pipe://${String.raw`\\.\pipe\paseo-managed-test`}`)).toEqual({
      type: "pipe",
      path: String.raw`\\.\pipe\paseo-managed-test`,
    });
  });
});
