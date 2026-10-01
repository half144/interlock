import { useState } from "react";
import { useStore } from "@/stores/app-store";
import { useCopy } from "@/hooks/useCopy";
import { useReview } from "@/features/workspace/hooks/useReview";
import type { DiffMode } from "@/features/workspace/utils/diff";
import type { Agent } from "@/types";

const STATUS_REQUEST = "Where are you at? Give me a short status update.";

export function useCodeTab(agent: Agent) {
  const sendMessage = useStore((s) => s.sendMessage);
  const maximized = useStore((s) => s.reviewMaximized);
  const openFile = useStore((s) => s.openFile);
  const closeFile = useStore((s) => s.closeFile);
  const { files, editor } = useReview(agent.id);
  const [mode, setMode] = useState<DiffMode>("unified");
  const { copied, copy } = useCopy();

  return {
    files,
    editor,
    file: files.find((f) => f.path === editor.active),
    maximized,
    mode,
    setMode,
    copied,
    copyPath: copy,
    open: (path: string, pin?: boolean) => openFile(agent.id, path, pin),
    close: (path: string) => closeFile(agent.id, path),
    askForStatus: () => void sendMessage(agent.threadId, STATUS_REQUEST, []),
  };
}
