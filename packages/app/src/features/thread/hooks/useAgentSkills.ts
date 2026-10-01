import { useEffect, useState } from "react";
import { listAgentSkills } from "@/daemon/skills";
import { useStore } from "@/stores/app-store";
import type { Skill } from "@/types";

export function useAgentSkills(agentId: string): Skill[] {
  const reportError = useStore((s) => s.reportError);
  const [loaded, setLoaded] = useState<{ agentId: string; skills: Skill[] } | null>(null);

  useEffect(() => {
    let current = true;
    listAgentSkills(agentId).then((skills) => {
      if (current) setLoaded({ agentId, skills });
    }, reportError);
    return () => {
      current = false;
    };
  }, [agentId, reportError]);

  return loaded?.agentId === agentId ? loaded.skills : [];
}
