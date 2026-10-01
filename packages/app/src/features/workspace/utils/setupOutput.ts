import type { SetupRun } from "@/types";

/** What the setup pane shows: the command output, then why it stopped if it failed. */
export function setupOutput(run: SetupRun | undefined): string {
  if (!run) return "";
  const failure = run.state === "failed" && run.error ? `\n${run.error}\n` : "";
  return `${run.log}${failure}`;
}

/** What to say over an empty setup screen, or null while there is output to read. */
export function setupNotice(run: SetupRun | undefined): string | null {
  if (!run) return "Setup output shows up here when the worktree is created.";
  if (setupOutput(run)) return null;
  if (run.state === "running") return "Running the setup script…";
  if (run.state === "blocked") return "Setup did not run for this worktree.";
  return "Setup finished without printing anything.";
}

/** A terminal wants CRLF; a bare LF only moves the cursor down. */
export const toTerminalText = (text: string) => text.replace(/\r?\n/g, "\r\n");

/**
 * What to write so the screen shows `next` after showing `previous`: just the new tail while the output
 * only grew, everything again (after a reset) when it changed under us.
 */
export function outputStep(previous: string, next: string): { reset: boolean; text: string } {
  if (next.startsWith(previous))
    return { reset: false, text: toTerminalText(next.slice(previous.length)) };
  return { reset: true, text: toTerminalText(next) };
}
