import { useRef } from "react";
import { motion } from "motion/react";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";
import { fadeIn } from "@/lib/motion";
import { ApiMock } from "@/components/preview/api/ApiMock/ApiMock";
import { WorktreeMock } from "@/components/preview/WorktreeMock/WorktreeMock";
import { VisualEdit } from "@/features/workspace/components/Workspace/PreviewFrame/PreviewCanvas/VisualEdit/VisualEdit";

interface PreviewCanvasProps {
  agent: Agent;
  isApi: boolean;
  mobile: boolean;
  editing: boolean;
  reloadKey: string;
}

/** The rendered app: an API exchange, a phone-sized page, or the desktop page scaled to fit. Reloading re-mounts it. */
export function PreviewCanvas({ agent, isApi, mobile, editing, reloadKey }: PreviewCanvasProps) {
  const root = useRef<HTMLDivElement>(null);

  return (
    <div className="absolute inset-0 overflow-auto bg-inset">
      <motion.div
        key={reloadKey}
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={fadeIn}
        style={{ transformOrigin: "top center" }}
        className={cn("min-h-full", mobile ? "flex justify-center px-6 py-6" : isApi ? "" : "p-3")}
      >
        {isApi ? (
          <ApiMock agent={agent} />
        ) : mobile ? (
          <div className="h-fit w-[390px] shrink-0 rounded-[34px] border border-seam-2 bg-[#1c1b19] p-2.5 shadow-overlay">
            <div ref={root} className="relative overflow-hidden rounded-[26px]">
              <WorktreeMock projectId={agent.projectId} compact />
              {editing && <VisualEdit rootRef={root} agent={agent} />}
            </div>
          </div>
        ) : (
          <div
            ref={root}
            className="relative overflow-hidden rounded-lg border border-seam shadow-card"
          >
            <WorktreeMock projectId={agent.projectId} />
            {editing && <VisualEdit rootRef={root} agent={agent} />}
          </div>
        )}
      </motion.div>
    </div>
  );
}
