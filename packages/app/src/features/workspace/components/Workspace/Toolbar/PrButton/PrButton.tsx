import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GitPullRequest } from "lucide-react";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscape } from "@/hooks/useEscape";
import { Button } from "@/components/ui/Button/Button";
import { surface } from "@/lib/styles";
import { PrPanel } from "./PrPanel/PrPanel";

interface PrButtonProps {
  agent: Agent;
  prNumber?: number | undefined;
  onOpen: () => void;
}

/** "Create PR" and its popover, like a publish control: base, reviewers, draft, then open. */
export function PrButton({ agent, prNumber, onOpen }: PrButtonProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);

  if (agent.aspect === "merged") {
    return (
      <Button size="sm" icon={<GitPullRequest />}>
        PR #{agent.pr}
      </Button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <Button
        size="sm"
        variant="primary"
        icon={<GitPullRequest />}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {prNumber ? `PR #${prNumber}` : "Create PR"}
      </Button>
      {!prNumber && (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-run ring-2 ring-raised"
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: fadeIn }}
            exit={{ opacity: 0, scale: 0.98, transition: fadeOut }}
            style={{ transformOrigin: "top right" }}
            className={cn(
              surface.frame,
              "absolute top-full right-0 z-40 mt-2 w-[300px] p-4 shadow-overlay",
            )}
          >
            <PrPanel
              agent={agent}
              prNumber={prNumber}
              draft={draft}
              onDraft={setDraft}
              onOpen={() => {
                setOpen(false);
                onOpen();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
