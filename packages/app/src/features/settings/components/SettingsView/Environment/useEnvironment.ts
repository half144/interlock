import { useEffect, useRef, useState } from "react";
import { loadProjectSettings } from "@/daemon/projectSettings";
import type { Project } from "@/types";
import { useDraft } from "@/features/settings/hooks/useDraft";
import { useSaveSettings } from "@/features/settings/hooks/useSaveSettings";
import { badName, savableEnv, type EnvVar } from "@/features/settings/utils/env";
import { linesOf, outsideRepo } from "@/features/settings/utils/lines";

const toRows = (vars: EnvVar[]) => vars.map((v): [string, string] => [v.name, v.value]);

export function useEnvironment(project: Project) {
  const { status, save } = useSaveSettings(project.id);
  const nextId = useRef(project.settings.env.length);
  const [revealed, setRevealed] = useState<ReadonlySet<number>>(new Set());
  const [included, setIncluded] = useState<string[]>([]);

  const vars = useDraft<EnvVar[]>(
    project.settings.env.map(([name, value], id) => ({ id, name, value })),
    (next) => {
      if (!badName(toRows(next))) void save({ env: savableEnv(toRows(next)) });
    },
  );
  const files = useDraft(project.settings.filesToCopy.join("\n"), (text) => {
    const lines = linesOf(text);
    if (!outsideRepo(lines)) void save({ filesToCopy: lines });
  });

  useEffect(() => {
    loadProjectSettings(project.id).then(
      (loaded) => setIncluded(loaded.worktreeInclude),
      (error: unknown) => console.error("Could not read .worktreeinclude", error),
    );
  }, [project.id]);

  const toggle = (id: number) =>
    setRevealed((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return {
    status,
    vars: vars.draft,
    revealed,
    included,
    nameError: badName(toRows(vars.draft)),
    filesText: files.draft,
    pathError: outsideRepo(linesOf(files.draft)),
    add: () => vars.edit([...vars.draft, { id: nextId.current++, name: "", value: "" }]),
    change: (id: number, patch: Partial<EnvVar>) =>
      vars.edit(vars.draft.map((v) => (v.id === id ? { ...v, ...patch } : v))),
    remove: (id: number) => {
      vars.edit(vars.draft.filter((v) => v.id !== id));
      vars.flush();
    },
    toggle,
    editFiles: files.edit,
    flushFiles: files.flush,
    flushVars: vars.flush,
  };
}
