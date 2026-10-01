import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import type { ProviderEntry } from "@/types";
import type { ModelChoice } from "@/features/home/types";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { ModelRow } from "../ModelRow/ModelRow";
import { ProviderTabs } from "../ProviderTabs/ProviderTabs";
import { EARLIER, useModelMenu } from "./useModelMenu";

interface ModelMenuProps {
  providers: ProviderEntry[];
  value: ModelChoice;
  maxHeight: number;
  onPick: (choice: ModelChoice) => void;
  onClose: () => void;
}

export function ModelMenu({ providers, value, maxHeight, onPick, onClose }: ModelMenuProps) {
  const id = useId();
  const menu = useModelMenu(providers, value, onPick, onClose);
  const row = (entry: (typeof menu.groups.current)[number]) => (
    <div key={entry.id} data-nav={entry.id}>
      <ModelRow
        id={`${id}-${entry.id}`}
        entry={entry}
        selected={menu.selectionIn(entry)}
        active={menu.active === entry.id}
        highlightId={`${id}-active`}
        onHover={() => menu.setActive(entry.id)}
        onPick={menu.pick}
      />
    </div>
  );

  return (
    <div
      ref={menu.root}
      role="presentation"
      tabIndex={-1}
      onKeyDown={menu.onKey}
      style={{ maxHeight }}
      className="flex flex-col p-1.5 outline-none"
    >
      <ProviderTabs providers={providers} value={menu.kind} onChange={menu.switchTo} />
      <div
        role="listbox"
        aria-label="Models"
        tabIndex={-1}
        aria-activedescendant={`${id}-${menu.active}`}
        className="mt-1.5 min-h-0 flex-1 overflow-y-auto"
      >
        {menu.groups.current.map(row)}
        {menu.groups.earlier.length > 0 && (
          <>
            <div data-nav={EARLIER}>
              <button
                type="button"
                tabIndex={-1}
                aria-expanded={menu.earlierOpen}
                onPointerEnter={() => menu.setActive(EARLIER)}
                onClick={menu.toggleEarlier}
                className="relative mt-1 flex h-8 w-full items-center gap-1.5 px-2.5 text-[12px] text-ink-3"
              >
                {menu.active === EARLIER && (
                  <motion.span
                    layoutId={`${id}-active`}
                    transition={spring}
                    className="absolute inset-0 rounded-[10px] bg-selected"
                  />
                )}
                <ChevronRight
                  className={cn(
                    "relative size-3 transition-transform duration-150",
                    menu.earlierOpen && "rotate-90",
                  )}
                />
                <span className="relative">Earlier models</span>
              </button>
            </div>
            <AnimatePresence initial={false}>
              {menu.earlierOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    transition: { height: spring, opacity: fadeIn },
                  }}
                  exit={{ height: 0, opacity: 0, transition: { height: spring, opacity: fadeOut } }}
                  className="overflow-clip"
                >
                  {menu.groups.earlier.map(row)}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
