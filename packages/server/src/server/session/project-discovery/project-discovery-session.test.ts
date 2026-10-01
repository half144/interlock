import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type pino from "pino";
import type { SessionOutboundMessage } from "../../messages.js";
import { ProjectDiscoverySession } from "./project-discovery-session.js";

const logger = { warn: vi.fn() } as unknown as pino.Logger;

describe("ProjectDiscoverySession", () => {
  let home: string;

  beforeEach(() => {
    home = mkdtempSync(path.join(tmpdir(), "project-discovery-"));
  });

  afterEach(() => {
    rmSync(home, { recursive: true, force: true });
  });

  it("answers with the repositories it found, their activity as ISO time", async () => {
    const touchedAt = new Date("2026-09-30T12:00:00Z");
    const head = path.join(home, "code/app/.git/HEAD");
    mkdirSync(path.dirname(head), { recursive: true });
    writeFileSync(head, "ref: refs/heads/main");
    utimesSync(head, touchedAt, touchedAt);
    const emitted: SessionOutboundMessage[] = [];
    const session = new ProjectDiscoverySession({
      host: { emit: (msg) => emitted.push(msg) },
      logger,
      home,
    });

    await session.handleDiscoverRequest({ type: "project.discover.request", requestId: "r1" });

    expect(emitted).toEqual([
      {
        type: "project.discover.response",
        payload: {
          requestId: "r1",
          repositories: [
            {
              path: path.join(home, "code/app"),
              name: "app",
              lastActivityAt: "2026-09-30T12:00:00.000Z",
            },
          ],
          error: null,
        },
      },
    ]);
  });
});
