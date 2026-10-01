import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { useStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";
import { Backdrop } from "@/components/ui/Backdrop/Backdrop";
import { surface } from "@/lib/styles";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { usePaletteItems } from "@/features/palette/hooks/usePaletteItems";
import { usePaletteNavigation } from "@/features/palette/hooks/usePaletteNavigation";
import { PaletteFooter } from "./PaletteFooter/PaletteFooter";
import { PaletteRow } from "./PaletteRow/PaletteRow";

/** The ⌘K dialog: a search field over grouped results, driven entirely from the keyboard. */
export function PaletteDialog() {
  const setPalette = useStore((s) => s.setPalette);
  const [query, setQuery] = useState("");
  const items = usePaletteItems(query);
  const dialog = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const { current, setActive, onKeyDown } = usePaletteNavigation(items, list);
  useFocusTrap(dialog);

  return (
    <Backdrop align="top" onClose={() => setPalette(false)}>
      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        initial={{ opacity: 0, scale: 0.98, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: fadeIn }}
        exit={{ opacity: 0, scale: 0.98, transition: fadeOut }}
        className={cn("flex w-[620px] flex-col overflow-hidden rounded-xl", surface.overlay)}
      >
        <div className="flex h-[52px] items-center gap-3 border-b border-seam px-4">
          <Search className="size-4 shrink-0 text-ink-3" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search agents, chats, commands…"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={items[current] ? `palette-${items[current].id}` : undefined}
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-3 focus:outline-none"
          />
        </div>

        <div
          ref={list}
          id="palette-list"
          role="listbox"
          className="max-h-[400px] overflow-y-auto p-2"
        >
          {items.length === 0 && (
            <div className="px-3 py-10 text-center">
              <p className="text-[13px] text-ink-2">Nothing matches “{query.trim()}”.</p>
              <p className="mt-1 text-[12.5px] text-ink-3">
                Try an ID like CHK-41, a project like ledger-api, or a branch name.
              </p>
            </div>
          )}
          {items.map((item, i) => (
            <div key={item.id}>
              {(i === 0 || items[i - 1]?.group !== item.group) && (
                <div
                  className={cn(
                    "px-3 pb-1.5 text-[12px] font-medium text-ink-3",
                    i === 0 ? "pt-1" : "pt-3",
                  )}
                >
                  {item.group}
                </div>
              )}
              <PaletteRow
                item={item}
                active={i === current}
                onHover={() => setActive(i)}
                onRun={item.run}
              />
            </div>
          ))}
        </div>

        <PaletteFooter />
      </motion.div>
    </Backdrop>
  );
}
