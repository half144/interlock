import type { Agent } from "@/types";
import { TerminalNotice } from "../TerminalNotice/TerminalNotice";
import { TerminalSurface } from "../TerminalSurface/TerminalSurface";
import { useSetupPane } from "./useSetupPane";

/** What the worktree's setup script printed, live while it runs. Read only. */
export function SetupPane({ agent }: { agent: Agent }) {
  const { hostRef, notice } = useSetupPane(agent);
  return (
    <TerminalSurface hostRef={hostRef} notice={notice && <TerminalNotice message={notice} />} />
  );
}
