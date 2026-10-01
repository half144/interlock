import { useState } from "react";
import { suggestSetupCommand } from "@/daemon/projectSettings";
import { useStore } from "@/stores/app-store";
import type { Project } from "@/types";
import { useDraft } from "@/features/settings/hooks/useDraft";
import { useSaveSettings } from "@/features/settings/hooks/useSaveSettings";
import { linesOf } from "@/features/settings/utils/lines";

export function useScripts(project: Project) {
  const { status, save } = useSaveSettings(project.id);
  const reportError = useStore((s) => s.reportError);
  const [note, setNote] = useState<string | null>(null);
  const script = useDraft(
    project.settings.setupCommands.join("\n"),
    (text) => void save({ setupCommands: linesOf(text) }),
  );

  const suggest = async () => {
    try {
      const command = await suggestSetupCommand(project.id);
      if (!command) {
        setNote("No lockfile found. Add the install command yourself.");
        return;
      }
      setNote(null);
      const lines = linesOf(script.draft);
      if (!lines.includes(command)) script.edit([command, ...lines].join("\n"));
      script.flush();
    } catch (error) {
      reportError(error);
    }
  };

  return { status, text: script.draft, edit: script.edit, flush: script.flush, suggest, note };
}
