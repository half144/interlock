import type { Hold } from "@/types";
import { Button } from "@/components/ui/Button/Button";
import { Markdown } from "@/features/thread/components/blocks/Markdown/Markdown";
import { HoldFrame } from "../HoldFrame/HoldFrame";
import { usePlanHold } from "./usePlanHold";

export function PlanHold({ agentId, hold }: { agentId: string; hold: Hold }) {
  const { fullAutoOffered, approve, reject, approveFullAuto, suggest } = usePlanHold(agentId, hold);

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
        <div className="mt-3 max-h-[320px] overflow-y-auto rounded-lg bg-inset px-3 py-2">
          <Markdown text={hold.plan} />
        </div>
      )}
    </HoldFrame>
  );
}
