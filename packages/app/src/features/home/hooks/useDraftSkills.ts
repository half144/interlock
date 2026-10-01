import { useEffect, useState } from "react";
import { listDraftSkills } from "@/daemon/skills";
import { useStore } from "@/stores/app-store";
import type { AgentKind, Skill } from "@/types";

/** The skills the next task would have: the chosen agent's, for the project folder. */
export function useDraftSkills(kind: AgentKind, cwd: string | undefined, model: string): Skill[] {
  const reportError = useStore((s) => s.reportError);
  const key = cwd === undefined ? null : `${kind}\n${cwd}\n${model}`;
  const [loaded, setLoaded] = useState<{ key: string; skills: Skill[] } | null>(null);

  useEffect(() => {
    if (cwd === undefined || key === null) return;
    let current = true;
    listDraftSkills(kind, cwd, model).then((skills) => {
      if (current) setLoaded({ key, skills });
    }, reportError);
    return () => {
      current = false;
    };
  }, [kind, cwd, model, key, reportError]);

  return loaded?.key === key ? loaded.skills : [];
}
