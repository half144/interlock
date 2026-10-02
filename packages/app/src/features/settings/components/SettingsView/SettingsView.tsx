import { Folder, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { monoText } from "@/lib/styles";
import { AgentsSection } from "./AgentsSection/AgentsSection";
import { Environment } from "./Environment/Environment";
import { FolderGeneral } from "./FolderGeneral/FolderGeneral";
import { General } from "./General/General";
import { Scripts } from "./Scripts/Scripts";
import { DangerZone } from "./DangerZone/DangerZone";
import { SettingsNav } from "./SettingsNav/SettingsNav";
import { useSettingsView } from "./useSettingsView";

/** One project's settings. The app keys this view by project, so switching projects starts fresh. */
export function SettingsView({ projectId }: { projectId: string }) {
  const { project, sections, scroller, active, onScroll, userInput, jump, openAccounts } =
    useSettingsView(projectId);
  if (!project) return null;

  return (
    <div ref={scroller} onScroll={onScroll} {...userInput} className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-[1100px] gap-10 px-8 pt-8 pb-24">
        <SettingsNav sections={sections} active={active} onJump={jump} />

        <div className="min-w-0 max-w-[880px] flex-1">
          <header className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg border border-seam bg-hover">
              <Folder className="size-[18px] text-ink-2" />
            </span>
            <div className="min-w-0">
              <h1 className="font-serif text-[24px] text-ink">Project settings</h1>
              <p className="text-[13px] text-ink-3">
                {project.name} ·{" "}
                <span className={monoText}>{project.remoteUrl ?? project.rootPath}</span>
              </p>
            </div>
            <Button className="ml-auto" size="sm" icon={<UserRound />} onClick={openAccounts}>
              Accounts
            </Button>
          </header>

          {project.git ? <General project={project} /> : <FolderGeneral project={project} />}
          {project.git && <Environment project={project} />}
          {project.git && <Scripts project={project} />}
          <AgentsSection project={project} />
          <DangerZone projectId={project.id} name={project.name} />
        </div>
      </div>
    </div>
  );
}
