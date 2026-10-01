import { describe, expect, it } from "vitest";
import { accessNote, shipFailureNote } from "./shipFailure";

describe("shipFailureNote", () => {
  it("suggests gh auth login when gh is not signed in", () => {
    const note = shipFailureNote({ code: "gh_unauthenticated", message: "You are not logged in" });
    expect(note.command).toBe("gh auth login");
    expect(note.detail).toBe("You are not logged in");
  });

  it("says what to do for a missing remote and a rejected push", () => {
    expect(shipFailureNote({ code: "no_remote", message: "m" }).title).toMatch(/GitHub remote/);
    expect(shipFailureNote({ code: "push_rejected", message: "m" }).hint).toMatch(
      /Update the branch/,
    );
  });

  it("keeps the daemon's words for failures it has no advice for", () => {
    const note = shipFailureNote({ code: "unknown", message: "boom" });
    expect(note).toMatchObject({ title: "The pull request could not be created", command: null });
    expect(note.detail).toBe("boom");
    expect(shipFailureNote({ code: "commit_failed", message: "x" }).title).toMatch(/committed/);
  });
});

describe("accessNote", () => {
  it("is silent when the forge is reachable", () => {
    expect(accessNote("ready")).toBeNull();
  });

  it("names the blocker otherwise", () => {
    expect(accessNote("gh_missing")?.command).toContain("gh auth login");
    expect(accessNote("no_remote")?.title).toMatch(/GitHub remote/);
  });
});
