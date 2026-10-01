import { Check, Minus } from "lucide-react";
import type { ToolStatus } from "@/types";
import { CommandHint } from "@/components/accounts/CommandHint/CommandHint";
import { TOOL_LABELS, stateOf } from "@/lib/diagnostics";
import { surface } from "@/lib/styles";
import { cn } from "@/lib/utils";

interface ToolLineProps {
  tool: ToolStatus;
  /** Why the tool matters, one line. */
  note: string;
}

function fixOf(tool: ToolStatus) {
  const state = stateOf(tool);
  if (state === "missing")
    return { label: "Install it, then check again", command: tool.installCommand };
  if (state === "needs-login")
    return { label: "Sign in from a terminal", command: tool.loginCommand };
  return null;
}

/** A tool that has no login of its own to run here (git, gh): its status and what to do about it. */
export function ToolLine({ tool, note }: ToolLineProps) {
  const state = stateOf(tool);
  const fix = fixOf(tool);

  return (
    <div className={cn(surface.frame, "flex flex-col gap-3 px-4 py-3.5")}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-medium text-ink">{TOOL_LABELS[tool.id]}</p>
          <p className="truncate text-[12.5px] text-ink-3">
            {state === "ready"
              ? [tool.account, tool.version && `v${tool.version}`].filter(Boolean).join(" · ")
              : note}
          </p>
        </div>
        {state === "ready" ? (
          <span className="flex items-center gap-1 text-[12.5px] text-green">
            <Check className="size-3.5" /> Ready
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[12.5px] text-ink-3">
            <Minus className="size-3.5" /> {state === "missing" ? "Not installed" : "Signed out"}
          </span>
        )}
      </div>
      {fix?.command && <CommandHint label={fix.label} command={fix.command} />}
    </div>
  );
}
