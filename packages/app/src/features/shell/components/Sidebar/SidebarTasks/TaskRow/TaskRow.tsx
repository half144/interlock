import { AnimatePresence, motion } from "motion/react";
import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  GitMerge,
  LoaderCircle,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import type { Aspect, Thread } from "@/types";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { useTaskRow } from "./useTaskRow";

const icon: Record<Aspect, { Icon: LucideIcon; className: string }> = {
  running: { Icon: LoaderCircle, className: "animate-spin-slow text-ink-3" },
  held: { Icon: CircleAlert, className: "text-hold" },
  failed: { Icon: CircleAlert, className: "text-red" },
  review: { Icon: CircleCheck, className: "text-ready" },
  merged: { Icon: GitMerge, className: "text-merge" },
  queued: { Icon: CircleDashed, className: "text-ink-3" },
  idle: { Icon: MessageSquare, className: "text-ink-3" },
  discarded: { Icon: MessageSquare, className: "text-ink-4" },
};

/** A task in the sidebar: its state as a small icon, plus an unread count. The selection background slides between rows. */
export function TaskRow({ thread, active }: { thread: Thread; active: boolean }) {
  const { agent, open } = useTaskRow(thread);
  if (!agent) return null;
  const { Icon, className } = icon[agent.aspect];

  return (
    <button
      type="button"
      onClick={open}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left transition-colors duration-150",
        !active && "hover:bg-hover",
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-task-active"
          transition={spring}
          className="absolute inset-0 rounded-lg bg-selected"
        />
      )}
      {/* The icon only animates when the task's state actually changes, e.g. running → ready for review. */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={agent.aspect}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring}
          className="relative flex shrink-0"
        >
          <Icon className={cn("size-4", className)} aria-label={agent.step} />
        </motion.span>
      </AnimatePresence>
      <span
        className={cn(
          "relative min-w-0 flex-1 truncate text-[14px]",
          active || agent.unseen > 0 ? "text-ink" : "text-ink-2",
        )}
      >
        {thread.title}
      </span>
      {agent.unseen > 0 && (
        <span className="relative inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-selected px-1 text-[11px] font-semibold text-ink-2 tabular-nums">
          {agent.unseen}
        </span>
      )}
    </button>
  );
}
