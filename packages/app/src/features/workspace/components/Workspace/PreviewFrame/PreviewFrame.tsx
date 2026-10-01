import { useState } from "react";
import type { Agent } from "@/types";
import { isApiProject } from "@/mocks/projects";
import { cn } from "@/lib/utils";
import { surface } from "@/lib/styles";
import { previewPaths, type Device } from "@/features/workspace/utils/preview";
import { PreviewBadge } from "./PreviewBadge/PreviewBadge";
import { PreviewCanvas } from "./PreviewCanvas/PreviewCanvas";
import { PreviewToolbar } from "./PreviewToolbar/PreviewToolbar";

/** The agent's running app, framed like a browser, with a visual edit mode on top. */
export function PreviewFrame({ agent }: { agent: Agent }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [editing, setEditing] = useState(false);
  const [reloads, setReloads] = useState(0);
  const isApi = isApiProject(agent.projectId);
  const mobile = device === "mobile" && !isApi;

  return (
    <div className={cn(surface.frame, "flex h-full flex-col overflow-hidden")}>
      <PreviewToolbar
        path={previewPaths[agent.projectId] ?? "/"}
        device={device}
        onDevice={setDevice}
        isApi={isApi}
        editing={editing}
        onToggleEdit={() => setEditing((e) => !e)}
        reloads={reloads}
        onReload={() => setReloads((n) => n + 1)}
      />
      <div className="relative min-h-0 flex-1">
        <PreviewCanvas
          agent={agent}
          isApi={isApi}
          mobile={mobile}
          editing={editing}
          reloadKey={`${reloads}-${device}`}
        />
        <PreviewBadge />
      </div>
    </div>
  );
}
