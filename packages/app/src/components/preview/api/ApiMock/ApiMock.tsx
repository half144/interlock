import type { Agent } from "@/types";
import { ApiBlock } from "./ApiBlock/ApiBlock";
import { backfill, refunds } from "./exchanges";

/** API projects have no page to render, so the preview is a live request against the worktree's server. */
export function ApiMock({ agent }: { agent: Agent }) {
  const x = agent.projectId === "ledger" ? refunds : backfill;
  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-2.5 font-mono text-[13px]">
        <span className="rounded-[4px] border border-seam-2 bg-raised px-1.5 py-0.5 text-[11px] font-semibold text-ink">
          {x.method}
        </span>
        <span className="text-ink">{x.path}</span>
        <span className="ml-auto text-[11px] text-green">{x.status}</span>
        <span className="text-[11px] text-ink-3">{x.timing}</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="placard">Headers</span>
        <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-1.5 font-mono text-xs">
          {x.headers.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-ink-3">{k}</dt>
              <dd className="truncate text-ink-2">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {x.body && <ApiBlock label="Request body" text={x.body} />}
      <ApiBlock label="Response" text={x.response} />

      {x.replay && <p className="border-t border-seam pt-4 text-[13px] text-ink-2">{x.replay}</p>}
    </div>
  );
}
