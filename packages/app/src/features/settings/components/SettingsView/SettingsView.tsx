import { useRef } from "react";
import { Folder } from "lucide-react";
import { projectOf } from "@/mocks/projects";
import { monoText } from "@/lib/styles";
import { projectIcon } from "@/features/settings/utils/projectIcons";
import { SECTIONS } from "@/features/settings/utils/sections";
import { useScrollSpy } from "@/features/settings/hooks/useScrollSpy";
import { AgentsSection } from "./AgentsSection/AgentsSection";
import { Budget } from "./Budget/Budget";
import { Environment } from "./Environment/Environment";
import { General } from "./General/General";
import { Integrations } from "./Integrations/Integrations";
import { Scripts } from "./Scripts/Scripts";
import { DangerZone } from "./DangerZone/DangerZone";
import { SettingsNav } from "./SettingsNav/SettingsNav";

const SECTION_IDS = SECTIONS.map((s) => s.id);

/** One project's settings. The app keys this view by project, so switching projects starts fresh. */
export function SettingsView({ projectId }: { projectId: string }) {
  const project = projectOf(projectId);
  const Icon = projectIcon[projectId] ?? Folder;
  const scroller = useRef<HTMLDivElement>(null);
  const { active, onScroll, jump } = useScrollSpy(scroller, SECTION_IDS);

  return (
    <div ref={scroller} onScroll={onScroll} className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-[1100px] gap-10 px-8 pt-8 pb-24">
        <SettingsNav active={active} onJump={jump} />

        <div className="min-w-0 max-w-[880px] flex-1">
          <header className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg border border-seam bg-hover">
              <Icon className="size-[18px] text-ink-2" />
            </span>
            <div className="min-w-0">
              <h1 className="font-serif text-[24px] text-ink">Project settings</h1>
              <p className="text-[13px] text-ink-3">
                {project.name} · <span className={monoText}>{project.repo}</span> · {project.stack}
              </p>
            </div>
          </header>

          <General project={project} />
          <Environment project={project} />
          <Scripts project={project} />
          <AgentsSection />
          <Integrations project={project} />
          <Budget project={project} />
          <DangerZone />
        </div>
      </div>
    </div>
  );
}
