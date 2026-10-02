import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, CornerDownRight, X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { useMessageQueue } from "./useMessageQueue";

const row = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1, transition: { height: spring, opacity: fadeIn } },
  exit: { height: 0, opacity: 0, transition: { height: spring, opacity: fadeOut } },
};

/** Messages waiting for the agent to finish, tucked behind the composer the way the tray is tucked under it. */
export function MessageQueue({ threadId }: { threadId: string }) {
  const { items, paused, remove, sendNow } = useMessageQueue(threadId);

  return (
    <AnimatePresence initial={false}>
      {items.length > 0 && (
        <motion.div
          key="queue"
          initial={{ height: 0, marginBottom: 0, opacity: 0 }}
          animate={{
            height: "auto",
            marginBottom: -16,
            opacity: 1,
            transition: { height: spring, marginBottom: spring, opacity: fadeIn },
          }}
          exit={{
            height: 0,
            marginBottom: 0,
            opacity: 0,
            transition: { height: spring, marginBottom: spring, opacity: fadeOut },
          }}
          style={{ overflow: "clip" }}
          className="mx-6"
        >
          <ul
            aria-label="Queued messages"
            className="max-h-36 overflow-y-auto rounded-t-2xl border border-b-0 border-seam bg-inset pb-4"
          >
            <AnimatePresence initial={false}>
              {items.map((m) => (
                <motion.li key={m.id} {...row} style={{ overflow: "clip" }}>
                  <div className="group flex h-9 items-center gap-2 pr-1.5 pl-3 text-[13px] text-ink-2">
                    <CornerDownRight className="size-3.5 shrink-0 text-ink-4" />
                    <span className="min-w-0 flex-1 truncate">
                      {m.text || `${m.files.length} attached`}
                    </span>
                    <span className="shrink-0 text-[12px] text-ink-4 group-focus-within:hidden group-hover:hidden">
                      {paused ? "Paused" : "Queued"}
                    </span>
                    <span className="hidden shrink-0 items-center group-focus-within:flex group-hover:flex">
                      <IconButton label="Send now" onClick={() => sendNow(m.id)}>
                        <ArrowUp />
                      </IconButton>
                      <IconButton label="Remove from queue" onClick={() => remove(m.id)}>
                        <X />
                      </IconButton>
                    </span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
