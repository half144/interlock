import { useEffect, useState } from "react";
import { listBranches } from "@/daemon/projectSettings";
import { useStore } from "@/stores/app-store";
import type { Project } from "@/types";
import { withCurrent } from "@/features/settings/utils/branches";
import { useSaveSettings } from "@/features/settings/hooks/useSaveSettings";

export function useGeneral(project: Project) {
  const { status, save } = useSaveSettings(project.id);
  const reportError = useStore((s) => s.reportError);
  const [branches, setBranches] = useState<string[]>([]);

  useEffect(() => {
    listBranches(project).then(setBranches, reportError);
  }, [project, reportError]);

  return {
    status,
    branches: withCurrent(branches, project.defaultBranch),
    pickBranch: (defaultBranch: string) => void save({ defaultBranch }),
    setArchive: (archiveAfterMerge: boolean) => void save({ archiveAfterMerge }),
  };
}
