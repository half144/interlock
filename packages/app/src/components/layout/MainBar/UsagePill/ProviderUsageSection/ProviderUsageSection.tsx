import type { ProviderView } from "@/lib/usage";
import { AgentMark } from "@/components/ui/AgentMark/AgentMark";
import { LeadWindow } from "./LeadWindow/LeadWindow";
import { UsageRow } from "./UsageRow/UsageRow";

/** One provider: the window closest to running out first, the others and any balance as quiet rows. */
export function ProviderUsageSection({ view }: { view: ProviderView }) {
  return (
    <section className="flex flex-col gap-3.5 px-4 py-3.5">
      <header className="flex items-center gap-2">
        <AgentMark kind={view.kind} />
        <h3 className="text-[13px] font-medium text-ink">{view.label}</h3>
        {view.plan && <span className="ml-auto text-[12px] text-ink-3">{view.plan}</span>}
      </header>
      {view.reason ? (
        <p className="text-[12.5px] text-ink-3">{view.reason}</p>
      ) : (
        <>
          {view.lead && <LeadWindow window={view.lead} />}
          {view.rest.length + view.balances.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {view.rest.map((w) => (
                <UsageRow
                  key={w.id}
                  label={w.label}
                  meta={w.resets}
                  value={w.remainingPct === null ? "–" : `${w.remainingPct}% left`}
                  tone={w.tone}
                />
              ))}
              {view.balances.map((b) => (
                <UsageRow key={b.id} label={b.label} value={b.text} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
