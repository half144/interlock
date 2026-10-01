import { CircleHelp, ListChecks, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import type { Hold, HoldKind } from "@/types";
import { useStore } from "@/stores/app-store";
import { Button } from "@/components/ui/Button/Button";
import { focusComposer } from "@/features/thread/utils/focusComposer";
import { monoText, surface } from "@/lib/styles";
import { cn } from "@/lib/utils";

const kinds: Record<HoldKind, { label: string; icon: LucideIcon }> = {
  question: { label: "Needs your decision", icon: CircleHelp },
  approval: { label: "Needs your permission", icon: ShieldCheck },
  plan: { label: "Needs your approval", icon: ListChecks },
  conflict: { label: "Needs you", icon: TriangleAlert },
};

const COMPOSE = new Set(["Let me explain", "Edit plan"]);

/** What the agent is asking, with the ways to answer it. Some answers go through the composer instead. */
export function HoldQuestion({ agentId, hold }: { agentId: string; hold: Hold }) {
  const resolveHold = useStore((s) => s.resolveHold);
  const { label, icon: Icon } = kinds[hold.kind];
  const options = (hold.options ?? []).filter((o) => o !== "Deny");
  const [primary, ...rest] = options;
  const command =
    hold.kind === "approval" ? hold.title.replace(/^Run /, "").replace(/\?$/, "") : null;
  const answer = (option: string) =>
    COMPOSE.has(option)
      ? focusComposer(option === "Edit plan" ? "Change the plan: " : "")
      : resolveHold(agentId, option);

  return (
    <div className={cn(surface.card, "p-5")}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-hold/10">
          <Icon className="size-4 text-hold" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-medium text-hold">{label}</p>
          <h3 className="mt-1 font-serif text-[17px] leading-snug font-bold text-ink [text-wrap:balance]">
            {hold.title}
          </h3>
          <p className="mt-1.5 text-[14px] leading-[1.6] text-ink-2 [text-wrap:pretty]">
            {hold.detail}
          </p>
          {command && (
            <div className={cn(monoText, "mt-3 rounded-lg bg-inset px-3 py-2 text-ink")}>
              <span className="text-ink-3">$ </span>
              {command}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        {hold.options?.includes("Deny") && (
          <button
            type="button"
            onClick={() => answer("Deny")}
            className="mr-auto rounded-lg px-2 py-1.5 text-[13.5px] text-red transition-[background-color,scale] duration-150 ease-out-quint hover:bg-red/10 active:scale-[0.97]"
          >
            Deny
          </button>
        )}
        {rest.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => answer(option)}
            className="h-9 rounded-lg bg-inset px-3.5 text-[13.5px] font-medium text-ink transition-[background-color,scale] duration-150 ease-out-quint hover:bg-selected active:scale-[0.97]"
          >
            {option}
          </button>
        ))}
        {primary && (
          <Button variant="primary" onClick={() => answer(primary)}>
            {primary}
          </Button>
        )}
      </div>
    </div>
  );
}
