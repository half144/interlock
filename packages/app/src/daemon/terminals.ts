import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import { getClient } from "./client";

const SHELL_NAME = "shell";
const RESTORED_SCROLLBACK_LINES = 200;

export interface TerminalSize {
  rows: number;
  cols: number;
}

export interface TerminalSink {
  output: (data: Uint8Array) => void;
  /** The screen as it is now, to draw over whatever is showing: sent on every (re)subscribe. */
  restore: (data: Uint8Array) => void;
  exit: () => void;
}

export interface TerminalConnection {
  input: (data: string) => void;
  resize: (size: TerminalSize) => void;
  close: () => void;
}

const opening = new Map<string, Promise<string>>();

/** The task's shell: the one its worktree already has, or a new one in it. Concurrent callers share one. */
export function ensureShell(
  target: { cwd: string; workspaceId: string | null },
  size: TerminalSize,
): Promise<string> {
  const pending = opening.get(target.cwd) ?? findOrCreateShell(target, size);
  opening.set(target.cwd, pending);
  return pending.finally(() => {
    if (opening.get(target.cwd) === pending) opening.delete(target.cwd);
  });
}

async function findOrCreateShell(
  target: { cwd: string; workspaceId: string | null },
  size: TerminalSize,
): Promise<string> {
  const client = getClient();
  const workspaceId = target.workspaceId ?? undefined;
  const listed = await client.listTerminals(target.cwd, undefined, {
    ...(workspaceId && { workspaceId }),
  });
  const existing = listed.terminals.find((terminal) => terminal.name === SHELL_NAME);
  if (existing) return existing.id;
  const created = await client.createTerminal(target.cwd, SHELL_NAME, undefined, {
    size,
    ...(workspaceId && { workspaceId }),
  });
  if (!created.terminal) {
    throw new Error(created.error ?? "The daemon could not open a shell. Try again.");
  }
  return created.terminal.id;
}

/**
 * How many connections hold each terminal's stream. The daemon keeps one stream per terminal, so letting go
 * of it while another connection (a remount, a quick pane switch) still wants it would cut that one off.
 */
const holders = new Map<string, number>();

function release(client: DaemonClient, terminalId: string): void {
  const left = (holders.get(terminalId) ?? 1) - 1;
  if (left > 0) {
    holders.set(terminalId, left);
    return;
  }
  holders.delete(terminalId);
  client.unsubscribeTerminal(terminalId);
}

/** Streams a daemon terminal into a sink. Bytes arrive as binary frames, so nothing is re-encoded on the way. */
export async function connectTerminal(
  terminalId: string,
  size: TerminalSize,
  sink: TerminalSink,
): Promise<TerminalConnection> {
  const client = getClient();
  const stops = [
    client.onTerminalStreamEvent((event) => {
      if (event.terminalId !== terminalId) return;
      if (event.type === "output") sink.output(event.data);
      else if (event.type === "restore") sink.restore(event.data);
    }),
    client.subscribeRawMessages((message) => {
      if (message.type === "terminal_stream_exit" && message.payload.terminalId === terminalId) {
        sink.exit();
      }
    }),
  ];
  const closeStreams = () => stops.forEach((stop) => stop());
  holders.set(terminalId, (holders.get(terminalId) ?? 0) + 1);

  try {
    const subscribed = await client.subscribeTerminal(terminalId, {
      restore: { mode: "visible-snapshot", scrollbackLines: RESTORED_SCROLLBACK_LINES, size },
    });
    if (subscribed.error) throw new Error(subscribed.error);
  } catch (error) {
    closeStreams();
    release(client, terminalId);
    throw error;
  }

  return {
    input: (data) => client.sendTerminalInput(terminalId, { type: "input", data }),
    resize: ({ rows, cols }) =>
      client.sendTerminalInput(terminalId, { type: "resize", rows, cols, intent: "claim" }),
    close: () => {
      closeStreams();
      release(client, terminalId);
    },
  };
}
