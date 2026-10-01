import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Agent } from "@/types";

const createPullRequest = vi.hoisted(() => vi.fn());
vi.mock("@/daemon/ship", () => ({ createPullRequest }));

const { useStore } = await import("../app-store");

const agent = { id: "a1", cwd: "/wt", base: "main" } as Agent;

describe("ship slice", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useStore.setState({ agents: { a1: agent }, threads: {}, shipped: {}, checkouts: {} });
  });

  it("keeps the PR number when a merge arrives without one", () => {
    const { setShipped } = useStore.getState();
    setShipped("/wt", { number: 7, url: "u", merged: false });
    setShipped("/wt", { number: null, url: "u", merged: true });
    expect(useStore.getState().shipped["/wt"]).toEqual({ number: 7, url: "u", merged: true });
  });

  it("opens the PR for the task's branch and remembers its link", async () => {
    createPullRequest.mockResolvedValue({ ok: true, number: 9, url: "https://gh/9" });
    const result = await useStore.getState().createPullRequest("a1", "Add refunds");
    expect(result).toEqual({ ok: true, number: 9, url: "https://gh/9" });
    expect(createPullRequest).toHaveBeenCalledWith({
      cwd: "/wt",
      title: "Add refunds",
      baseRef: "main",
      planItems: [],
    });
    expect(useStore.getState().shipped["/wt"]).toEqual({
      number: 9,
      url: "https://gh/9",
      merged: false,
    });
  });

  it("hands a refusal back to the dialog and records nothing", async () => {
    const error = { code: "no_remote", message: "No remote" };
    createPullRequest.mockResolvedValue({ ok: false, error });
    const result = await useStore.getState().createPullRequest("a1", "x");
    expect(result).toEqual({ ok: false, error });
    expect(useStore.getState().shipped).toEqual({});
  });

  it("turns a failed request into an error result instead of throwing", async () => {
    createPullRequest.mockRejectedValue(new Error("socket closed"));
    const result = await useStore.getState().createPullRequest("a1", "x");
    expect(result).toEqual({ ok: false, error: { code: "unknown", message: "socket closed" } });
  });
});
