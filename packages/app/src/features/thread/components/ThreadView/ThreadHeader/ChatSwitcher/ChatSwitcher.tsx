import { ChevronDown } from "lucide-react";
import type { Aspect, Thread } from "@/types";
import { useStore } from "@/stores/app-store";
import { Lamp } from "@/components/ui/Lamp/Lamp";
import { MenuItem } from "@/components/ui/MenuItem/MenuItem";
import { Popover } from "@/components/ui/Popover/Popover";

const ACTIVE: Aspect[] = ["running", "held", "review"];

/**
 * The mini-IDE's way out: the chat's title opens the list of active chats, and picking one returns to the
 * normal layout with that chat open.
 */
export function ChatSwitcher({ threadId }: { threadId: string }) {
  const threads = useStore((s) => s.threads);
  const agents = useStore((s) => s.agents);
  const openThread = useStore((s) => s.openThread);
  const current = threads[threadId];
  const aspectOf = (t: Thread) => agents[t.agentIds[0] ?? ""]?.aspect;
  const active = Object.values(threads).flatMap((t) => {
    const aspect = aspectOf(t);
    return aspect && ACTIVE.includes(aspect) ? [{ thread: t, aspect }] : [];
  });
  const currentAspect = current && aspectOf(current);

  if (!current || !currentAspect) return null;

  return (
    <Popover
      className="w-[320px]"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="inline-flex h-8 min-w-0 items-center gap-2 rounded-lg px-2 text-[15px] font-medium text-ink transition-colors hover:bg-hover"
        >
          <Lamp aspect={currentAspect} />
          <span className="truncate">{current.title}</span>
          <ChevronDown className="size-4 shrink-0 text-ink-3" />
        </button>
      )}
    >
      {(close) => (
        <>
          <p className="px-2 pt-1 pb-1.5 text-[12px] text-ink-3">Active chats</p>
          {active.map(({ thread: t, aspect }) => (
            <MenuItem
              key={t.id}
              active={t.id === threadId}
              onSelect={() => {
                close();
                if (t.id !== threadId) openThread(t.id);
              }}
            >
              <Lamp aspect={aspect} />
              <span className="truncate">{t.title}</span>
            </MenuItem>
          ))}
        </>
      )}
    </Popover>
  );
}
