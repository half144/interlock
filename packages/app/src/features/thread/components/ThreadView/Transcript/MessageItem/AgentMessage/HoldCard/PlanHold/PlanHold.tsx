import type { Hold } from "@/types";
import { Button } from "@/components/ui/Button/Button";
import { Markdown } from "@/features/thread/components/blocks/Markdown/Markdown";
import { cn } from "@/lib/utils";
import { HoldFrame } from "../HoldFrame/HoldFrame";
import { usePlanHold } from "./usePlanHold";

export function PlanHold({ agentId, hold }: { agentId: string; hold: Hold }) {
  const { plan, fullAutoOffered, approve, reject, approveFullAuto, suggest } = usePlanHold(
    agentId,
    hold,
  );

  return (
    <HoldFrame
      kind="plan"
      title={hold.title}
      summary={hold.detail}
      actions={
        <>
          <Button variant="danger" className="mr-auto" onClick={reject}>
            Reject
          </Button>
          <Button variant="ghost" onClick={suggest}>
            Suggest changes
          </Button>
          {fullAutoOffered && (
            <Button onClick={approveFullAuto}>Approve and run on full auto</Button>
          )}
          <Button variant="primary" onClick={approve}>
            Approve
          </Button>
        </>
      }
    >
      {hold.plan && (
        <div
          ref={plan.ref}
          onScroll={plan.onScroll}
          className={cn(
            "mt-3 max-h-[320px] overflow-y-auto rounded-lg bg-inset px-3 py-2",
            plan.fade &&
              "[mask-image:linear-gradient(to_bottom,black_calc(100%-40px),transparent)]",
          )}
        >
          <Markdown text={hold.plan} />
        </div>
      )}
    </HoldFrame>
  );
}
