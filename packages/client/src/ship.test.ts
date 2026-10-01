import { afterEach, expect, test } from "vitest";
import { z } from "zod";
import { DaemonClient, type DaemonEvent, type DaemonTransport } from "./daemon-client";

function createTransport() {
  const sent: string[] = [];
  let onMessage: (data: unknown) => void = () => undefined;
  let onOpen: () => void = () => undefined;
  const transport: DaemonTransport = {
    send: (data) => {
      if (typeof data === "string") sent.push(data);
    },
    close: () => undefined,
    onMessage: (handler) => {
      onMessage = handler;
      return () => undefined;
    },
    onOpen: (handler) => {
      onOpen = handler;
      return () => undefined;
    },
    onClose: () => () => undefined,
    onError: () => () => undefined,
  };
  return {
    transport,
    sent,
    deliver: (message: unknown) => onMessage(JSON.stringify({ type: "session", message })),
    open: () => {
      onOpen();
      sent.length = 0;
      onMessage(
        JSON.stringify({
          type: "session",
          message: {
            type: "status",
            payload: { status: "server_info", serverId: "srv", hostname: null, version: null },
          },
        }),
      );
    },
  };
}

const clients: DaemonClient[] = [];
afterEach(async () => {
  await Promise.all(clients.map((client) => client.close()));
  clients.length = 0;
});

async function connectedClient() {
  const mock = createTransport();
  const client = new DaemonClient({
    url: "ws://test",
    clientId: "clsk_ship_test",
    reconnect: { enabled: false },
    transportFactory: () => mock.transport,
  });
  clients.push(client);
  const connecting = client.connect();
  mock.open();
  await connecting;
  return { client, mock };
}

function lastRequest(sent: string[]): Record<string, unknown> {
  const frame = z
    .object({ message: z.record(z.string(), z.unknown()) })
    .parse(JSON.parse(sent.at(-1) ?? "{}"));
  return frame.message;
}

test("createTaskPr sends the task title and plan and resolves with the PR", async () => {
  const { client, mock } = await connectedClient();

  const pending = client.createTaskPr({
    cwd: "/wt/task",
    title: "Fix login",
    planItems: [{ text: "Add test", status: "completed" }],
  });
  const request = lastRequest(mock.sent);
  expect(request).toMatchObject({
    type: "task_create_pr_request",
    cwd: "/wt/task",
    title: "Fix login",
    planItems: [{ text: "Add test", status: "completed" }],
  });

  mock.deliver({
    type: "task_create_pr_response",
    payload: {
      cwd: "/wt/task",
      number: 7,
      url: "https://github.com/acme/repo/pull/7",
      committed: true,
      error: null,
      requestId: request["requestId"],
    },
  });
  await expect(pending).resolves.toMatchObject({ number: 7, committed: true, error: null });
});

test("createTaskPr resolves with an actionable error instead of throwing", async () => {
  const { client, mock } = await connectedClient();

  const pending = client.createTaskPr({ cwd: "/wt/task", title: "Fix login" });
  mock.deliver({
    type: "task_create_pr_response",
    payload: {
      cwd: "/wt/task",
      number: null,
      url: null,
      committed: false,
      error: { code: "gh_unauthenticated", message: "Run `gh auth login`." },
      requestId: lastRequest(mock.sent)["requestId"],
    },
  });
  await expect(pending).resolves.toMatchObject({ error: { code: "gh_unauthenticated" } });
});

test("discardTask resolves with the discard result", async () => {
  const { client, mock } = await connectedClient();

  const pending = client.discardTask("/wt/task");
  const request = lastRequest(mock.sent);
  expect(request).toMatchObject({ type: "task_discard_request", cwd: "/wt/task" });
  mock.deliver({
    type: "task_discard_response",
    payload: {
      cwd: "/wt/task",
      success: true,
      branchDeleted: true,
      error: null,
      requestId: request["requestId"],
    },
  });
  await expect(pending).resolves.toMatchObject({ success: true, branchDeleted: true });
});

test("surfaces merged updates as daemon events", async () => {
  const { client, mock } = await connectedClient();
  const events: DaemonEvent[] = [];
  client.subscribe((event) => events.push(event));

  mock.deliver({
    type: "task_ship_update",
    payload: {
      kind: "merged",
      cwd: "/wt/task",
      url: "https://github.com/acme/repo/pull/7",
      archived: true,
    },
  });

  expect(events).toContainEqual({
    type: "task_ship_update",
    payload: {
      kind: "merged",
      cwd: "/wt/task",
      url: "https://github.com/acme/repo/pull/7",
      archived: true,
    },
  });
});
