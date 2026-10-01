import { expect, test } from "vitest";
import {
  ForgeAuthenticationError,
  ForgeCliMissingError,
} from "../../../services/forge-cli-command.js";
import { CommitFailedError, NoRemoteError, PushRejectedError, toShipError } from "./ship-errors.js";

test("maps each failure to a code and tells the user what to do", () => {
  expect(toShipError(new ForgeCliMissingError("missing"))).toMatchObject({
    code: "gh_missing",
    message: expect.stringContaining("gh auth login"),
  });
  expect(toShipError(new ForgeAuthenticationError("auth", { stderr: "" }))).toMatchObject({
    code: "gh_unauthenticated",
    message: expect.stringContaining("gh auth login"),
  });
  expect(toShipError(new NoRemoteError(false))).toMatchObject({
    code: "no_remote",
    message: expect.stringContaining("git remote add origin"),
  });
  expect(toShipError(new PushRejectedError("feature", "non-fast-forward"))).toMatchObject({
    code: "push_rejected",
  });
  expect(toShipError(new CommitFailedError("hook failed"))).toMatchObject({
    code: "commit_failed",
  });
  expect(toShipError(new Error("boom"))).toEqual({ code: "unknown", message: "boom" });
});
