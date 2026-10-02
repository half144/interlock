import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { listFolder, type FolderEntry } from "@/daemon/files";
import { useStore } from "@/stores/app-store";
import { ancestorsOf, buildTree, type Listings } from "@/features/workspace/utils/fileTree";
import type { Agent, FileDiff } from "@/types";

/** The folders to list up front: the root, and every folder above a changed file so the changes sit among real siblings. */
const foldersToList = (files: FileDiff[]) => [
  "",
  ...new Set(files.flatMap((file) => ancestorsOf(file.path))),
];

/** Arrow keys walk the visible rows; right and left open and close the folder under focus. */
function navigate(event: KeyboardEvent<HTMLElement>) {
  const rows = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("li > button:enabled")];
  const at = rows.indexOf(document.activeElement as HTMLButtonElement);
  const row = rows[at];
  const step = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: rows.length - 1 }[event.key];
  if (step !== undefined) {
    event.preventDefault();
    rows[Math.min(rows.length - 1, Math.max(0, step))]?.focus();
    return;
  }
  const expanded = row?.getAttribute("aria-expanded");
  if (
    (event.key === "ArrowRight" && expanded === "false") ||
    (event.key === "ArrowLeft" && expanded === "true")
  ) {
    event.preventDefault();
    row?.click();
  }
}

export function useExplorer(agent: Agent, files: FileDiff[]) {
  const projectName = useStore((s) => s.projects[agent.projectId]?.name);
  const reportError = useStore((s) => s.reportError);
  const [listings, setListings] = useState<Listings>({});
  const requested = useRef(new Set<string>());
  const { cwd } = agent;
  const wanted = foldersToList(files).join("\n");

  const load = useCallback(
    (path: string, quiet = false) => {
      if (requested.current.has(path)) return;
      requested.current.add(path);
      const show = (entries: FolderEntry[]) => setListings((c) => ({ ...c, [path]: entries }));
      listFolder(cwd, path || ".")
        .then(show)
        .catch((error: unknown) => {
          if (quiet) {
            // A folder above a change can be gone: the change is the deletion of everything in it.
            show([]);
            return;
          }
          requested.current.delete(path);
          reportError(error);
        });
    },
    [cwd, reportError],
  );

  useEffect(() => {
    for (const path of wanted.split("\n")) load(path, true);
  }, [wanted, load]);

  return {
    projectName,
    tree: useMemo(() => buildTree(files, listings), [files, listings]),
    load,
    navigate,
  };
}
