import type { Hold } from "@/types";
import { Button } from "@/components/ui/Button/Button";
import { HoldFrame } from "../HoldFrame/HoldFrame";
import { HoldTarget } from "./HoldTarget/HoldTarget";
import { useApprovalHold } from "./useApprovalHold";

export function ApprovalHold({ agentId, hold }: { agentId: string; hold: Hold }) {
  const { primary, others, answer, deny } = useApprovalHold(agentId, hold);

  return (
    <HoldFrame
      kind={hold.kind}
      title={hold.title}
      summary={hold.detail}
      actions={
        <>
          <Button variant="danger" className="mr-auto" onClick={deny}>
            Deny
          </Button>
          {others.map((option) => (
            <Button key={option} onClick={() => answer(option)}>
              {option}
            </Button>
          ))}
          {primary && (
            <Button variant="primary" onClick={() => answer(primary)}>
              {primary}
            </Button>
          )}
        </>
      }
    >
      <HoldTarget command={hold.command} file={hold.file} />
    </HoldFrame>
  );
}
