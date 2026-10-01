import { beforeEach, describe, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({
  listTerminals: vi.fn(),
  createTerminal: vi.fn(),
  subscribeTerminal: vi.fn(),
  unsubscribeTerminal: vi.fn(),
  sendTerminalInput: vi.fn(),
  onTerminalStreamEvent: vi.fn(),
  subscribeRawMessages: vi.fn(),
}));
vi.mock("./client", () => ({ getClient: () => client }));

const { connectTerminal, ensureShell } = await import("./terminals");

const SIZE = { rows: 24, cols: 80 };

let emit: (event: { terminalId: string; type: "output" | "restore"; data: Uint8Array }) => void;
let emitRaw: (message: { type: string; payload: { terminalId: string } }) => void;

beforeEach(() => {
  vi.resetAllMocks();
  client.onTerminalStreamEvent.mockImplementation((handler: typeof emit) => {
    emit = handler;
    return vi.fn();
  });
  client.subscribeRawMessages.mockImplementation((handler: typeof emitRaw) => {
    emitRaw = handler;
    return vi.fn();
  });
  client.subscribeTerminal.mockResolvedValue({ terminalId: "t1", error: null });
});

describe("ensureShell", () => {
  it("reuses the shell the worktree already has", async () => {
    client.listTerminals.mockResolvedValue({
      terminals: [
        { id: "a", name: "agent" },
        { id: "b", name: "shell" },
      ],
    });
    await expect(ensureShell({ cwd: "/wt", workspaceId: "w1" }, SIZE)).resolves.toBe("b");
    expect(client.createTerminal).not.toHaveBeenCalled();
  });

  it("opens a shell in the worktree when there is none", async () => {
    client.listTerminals.mockResolvedValue({ terminals: [] });
    client.createTerminal.mockResolvedValue({ terminal: { id: "n" }, error: null });
    await expect(ensureShell({ cwd: "/wt", workspaceId: null }, SIZE)).resolves.toBe("n");
    expect(client.createTerminal).toHaveBeenCalledWith("/wt", "shell", undefined, { size: SIZE });
  });

  it("says why when the daemon refuses", async () => {
    client.listTerminals.mockResolvedValue({ terminals: [] });
    client.createTerminal.mockResolvedValue({ terminal: null, error: "no pty" });
    await expect(ensureShell({ cwd: "/wt", workspaceId: null }, SIZE)).rejects.toThrow("no pty");
  });
});

describe("connectTerminal", () => {
  const sink = () => ({ output: vi.fn(), restore: vi.fn(), exit: vi.fn() });

  it("subscribes with the pane's size and routes only its own frames", async () => {
    const target = sink();
    await connectTerminal("t1", SIZE, target);
    expect(client.subscribeTerminal).toHaveBeenCalledWith("t1", {
      restore: { mode: "visible-snapshot", scrollbackLines: 200, size: SIZE },
    });

    const data = new Uint8Array([104, 105]);
    emit({ terminalId: "t1", type: "restore", data });
    emit({ terminalId: "t1", type: "output", data });
    emit({ terminalId: "other", type: "output", data });
    expect(target.restore).toHaveBeenCalledTimes(1);
    expect(target.output).toHaveBeenCalledTimes(1);

    emitRaw({ type: "terminal_stream_exit", payload: { terminalId: "t1" } });
    expect(target.exit).toHaveBeenCalledTimes(1);
  });

  it("sends keystrokes and size changes on the terminal's stream", async () => {
    const connection = await connectTerminal("t1", SIZE, sink());
    connection.input("ls\r");
    connection.resize({ rows: 30, cols: 100 });
    expect(client.sendTerminalInput).toHaveBeenCalledWith("t1", { type: "input", data: "ls\r" });
    expect(client.sendTerminalInput).toHaveBeenCalledWith("t1", {
      type: "resize",
      rows: 30,
      cols: 100,
      intent: "claim",
    });
  });

  it("lets go of the stream on close and when the subscribe fails", async () => {
    const connection = await connectTerminal("t5", SIZE, sink());
    connection.close();
    expect(client.unsubscribeTerminal).toHaveBeenCalledWith("t5");

    client.subscribeTerminal.mockResolvedValue({ terminalId: "t2", error: "Terminal not found" });
    await expect(connectTerminal("t2", SIZE, sink())).rejects.toThrow("Terminal not found");
    expect(client.unsubscribeTerminal).toHaveBeenCalledWith("t2");
  });

  it("keeps the stream while another connection still holds the terminal", async () => {
    const first = await connectTerminal("t3", SIZE, sink());
    const second = await connectTerminal("t3", SIZE, sink());
    first.close();
    expect(client.unsubscribeTerminal).not.toHaveBeenCalled();
    second.close();
    expect(client.unsubscribeTerminal).toHaveBeenCalledWith("t3");
  });
});
