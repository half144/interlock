import type { ProviderView } from "@/lib/usage";
import { cn } from "@/lib/utils";
import { AgentMark } from "@/components/ui/AgentMark/AgentMark";

function WindowRow({ window }: { window: ProviderView["windows"][number] }) {
  const left = window.remainingPct === null ? null : Math.round(window.remainingPct);

  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="text-ink-2">{window.label}</span>
        <span className="text-ink-3 tabular-nums">
          {left === null ? "No data" : `${left}% left`}
          {window.resets && ` · resets in ${window.resets}`}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-inset">
        <div
          className={cn("h-full rounded-full", window.low ? "bg-hold" : "bg-ink-3")}
          style={{ width: `${left ?? 0}%` }}
        />
      </div>
    </li>
  );
}

/** One provider's windows and balances; a provider with nothing to show says why, dimmed. */
export function ProviderUsageSection({ view }: { view: ProviderView }) {
  const reason = view.ring.kind === "unavailable" ? view.ring.reason : null;

  return (
    <section className={cn("flex flex-col gap-3", reason && "opacity-60")}>
      <header className="flex items-center gap-2">
        <AgentMark kind={view.kind} />
        <h3 className="text-[13.5px] font-medium text-ink">{view.label}</h3>
        {view.plan && <span className="text-[12px] text-ink-3 capitalize">{view.plan}</span>}
      </header>
      {reason && <p className="text-[13px] text-ink-3">{reason}</p>}
      {view.windows.length > 0 && (
        <ul className="flex flex-col gap-3">
          {view.windows.map((w) => (
            <WindowRow key={w.id} window={w} />
          ))}
        </ul>
      )}
      {view.balances.map((b) => (
        <p key={b.id} className="flex justify-between text-[13px]">
          <span className="text-ink-2">{b.label}</span>
          <span className="text-ink-3 tabular-nums">{b.text}</span>
        </p>
      ))}
    </section>
  );
}
