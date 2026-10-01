import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "@/hooks/useCopy";
import { Button } from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import { field, monoText } from "@/lib/styles";
import { CopyIcon } from "@/features/workspace/components/CopyIcon/CopyIcon";

interface PrLiveModalProps {
  repo: string;
  number: number;
  onClose: () => void;
  onChecks: () => void;
}

/** The moment the PR exists: its link, and the two things you do next. */
export function PrLiveModal({ repo, number, onClose, onChecks }: PrLiveModalProps) {
  const { copied, copy } = useCopy();
  const url = `github.com/${repo}/pull/${number}`;

  return (
    <Modal
      title={`Pull request #${number} is open`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onChecks}>View checks</Button>
          <Button variant="primary" icon={<ExternalLink />}>
            Open PR
          </Button>
        </>
      }
    >
      <p className="text-[13.5px] text-ink-2">
        Checks are running on it now. Reviews and comments show up in this task as they come in.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <span className={cn(field, monoText, "flex h-9 min-w-0 flex-1 items-center px-3")}>
          <span className="truncate">{url}</span>
        </span>
        <Button
          aria-label={copied ? "Copied" : "Copy link"}
          onClick={() => copy(`https://${url}`)}
          className="w-9 px-0"
        >
          <CopyIcon copied={copied} />
        </Button>
      </div>
    </Modal>
  );
}
