import { openExternal } from "@/platform/desktop";
import { Check as Passed, ExternalLink, LoaderCircle, Minus, X as Failed } from "lucide-react";
import type { Check, CheckState } from "@/types";
import { cn } from "@/lib/utils";

const MARK: Record<CheckState, { icon: typeof Passed; tone: string; label: string }> = {
  success: { icon: Passed, tone: "text-green", label: "Passed" },
  failure: { icon: Failed, tone: "text-red", label: "Failed" },
  pending: {
    icon: LoaderCircle,
    tone: "animate-spin-slow text-hold",
    label: "Running",
  },
  cancelled: { icon: Minus, tone: "text-ink-3", label: "Cancelled" },
  skipped: { icon: Minus, tone: "text-ink-4", label: "Skipped" },
};

/** One check of the pull request: how it ended, its name, how long it took and a link to its run. */
export function CheckRow({ check }: { check: Check }) {
  const { icon: Icon, tone, label } = MARK[check.state];
  const { url } = check;
  return (
    <li className="flex h-10 items-center gap-3 border-b border-seam px-4 text-[13px] last:border-b-0">
      <Icon aria-label={label} className={cn("size-4 shrink-0", tone)} />
      <span className="min-w-0 flex-1 truncate text-ink">
        {check.name}
        {check.workflow && <span className="ml-2 text-ink-3">{check.workflow}</span>}
      </span>
      {check.duration && <span className="shrink-0 text-ink-3 tabular-nums">{check.duration}</span>}
      {url && (
        <a
          href={url}
          onClick={(e) => {
            e.preventDefault();
            void openExternal(url);
          }}
          aria-label={`Open ${check.name} on GitHub`}
          className="shrink-0 text-ink-3 hover:text-ink"
        >
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </li>
  );
}
