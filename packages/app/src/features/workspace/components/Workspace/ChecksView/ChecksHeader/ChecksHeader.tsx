import { openExternal } from "@/platform/desktop";
import { ExternalLink } from "lucide-react";
import type { Agent } from "@/types";
import { PrStatus } from "@/components/ship/PrStatus/PrStatus";

interface ChecksHeaderProps {
  agent: Agent;
  title: string | null;
  url: string | null;
}

/** The pull request the checks belong to: its status, its title and a link to it. */
export function ChecksHeader({ agent, title, url }: ChecksHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-seam px-4 py-3">
      <PrStatus agent={agent} />
      <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{title}</span>
      {url && (
        <a
          href={url}
          onClick={(e) => {
            e.preventDefault();
            void openExternal(url);
          }}
          aria-label="Open the pull request on GitHub"
          className="shrink-0 text-ink-3 hover:text-ink"
        >
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </header>
  );
}
