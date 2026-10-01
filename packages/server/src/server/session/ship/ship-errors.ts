import type { TaskShipError } from "@interlock/protocol/messages";
import {
  ForgeAuthenticationError,
  ForgeCliMissingError,
} from "../../../services/forge-cli-command.js";

export class NoRemoteError extends Error {
  constructor(hasOrigin: boolean) {
    super(
      hasOrigin
        ? "The origin remote is not a GitHub repository. Point it at GitHub (`git remote set-url origin <url>`) and try again."
        : "This repository has no origin remote. Add one with `git remote add origin <url>` and try again.",
    );
    this.name = "NoRemoteError";
  }
}

export class PushRejectedError extends Error {
  constructor(branch: string, detail: string) {
    super(
      `GitHub rejected the push of ${branch}. Pull the latest changes or check your permissions, then try again.${detail ? ` (${detail})` : ""}`,
    );
    this.name = "PushRejectedError";
  }
}

export class CommitFailedError extends Error {
  constructor(detail: string) {
    super(`Could not commit the task's changes: ${detail}`);
    this.name = "CommitFailedError";
  }
}

export function toShipError(error: unknown): TaskShipError {
  if (error instanceof ForgeCliMissingError) {
    return {
      code: "gh_missing",
      message:
        "The GitHub CLI (gh) is not installed. Install it from https://cli.github.com, run `gh auth login`, and try again.",
    };
  }
  if (error instanceof ForgeAuthenticationError) {
    return {
      code: "gh_unauthenticated",
      message: "The GitHub CLI is not logged in. Run `gh auth login` in a terminal and try again.",
    };
  }
  if (error instanceof NoRemoteError) return { code: "no_remote", message: error.message };
  if (error instanceof PushRejectedError) return { code: "push_rejected", message: error.message };
  if (error instanceof CommitFailedError) return { code: "commit_failed", message: error.message };
  return { code: "unknown", message: error instanceof Error ? error.message : String(error) };
}
