import { ExternalLink } from "lucide-react";
import type { PullRequestView } from "@/lib/pullRequest";
import { Button } from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import { ChecksDot } from "@/components/ship/ChecksDot/ChecksDot";
import { CopyField } from "@/components/ship/CopyField/CopyField";
import { PrState } from "@/components/ship/PrState/PrState";
import { usePrModal } from "./usePrModal";

interface PrModalProps {
  pr: PullRequestView;
  onClose: () => void;
}

/** The task's pull request as GitHub has it: its state, how its checks stand and a link to it. */
export function PrModal({ pr, onClose }: PrModalProps) {
  const { openOnGitHub, showChecks } = usePrModal(pr, onClose);

  return (
    <Modal
      title={pr.number ? `Pull request #${pr.number}` : "Pull request"}
      onClose={onClose}
      footer={
        <>
          <Button onClick={showChecks}>View checks</Button>
          <Button
            variant="primary"
            icon={<ExternalLink />}
            disabled={!pr.url}
            onClick={openOnGitHub}
          >
            Open PR
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <PrState pr={pr} />
        <span className="flex items-center gap-1.5 text-[13px] text-ink-2">
          <ChecksDot state={pr.summary.state} />
          {pr.summary.label}
        </span>
      </div>
      {pr.title && <p className="mt-3 text-[14px] font-medium text-ink">{pr.title}</p>}
      {pr.url && (
        <div className="mt-4">
          <CopyField value={pr.url} label="Copy link" />
        </div>
      )}
      {pr.phase === "open" && pr.summary.state === "none" && (
        <p className="mt-3 text-[13px] text-ink-3">
          Checks show up here once GitHub starts them. Reviews and merges are picked up
          automatically.
        </p>
      )}
    </Modal>
  );
}
