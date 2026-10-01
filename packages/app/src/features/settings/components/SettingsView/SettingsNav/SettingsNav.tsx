import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { SECTIONS } from "@/features/settings/utils/sections";

/** The sticky list of sections on the left of the settings page. */
export function SettingsNav({ active, onJump }: { active: string; onJump: (id: string) => void }) {
  return (
    <nav
      aria-label="Settings sections"
      className="sticky top-8 flex w-[180px] shrink-0 flex-col gap-px self-start"
    >
      {SECTIONS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onJump(item.id)}
          aria-current={active === item.id ? "true" : undefined}
          className={cn(
            "relative h-7 rounded-md px-2.5 text-left text-[13px] transition-colors duration-150",
            active === item.id
              ? "font-medium text-ink"
              : "text-ink-3 hover:bg-hover hover:text-ink-2",
          )}
        >
          {/* Follows the scroll spy, so the highlight glides down the list as you read instead of blinking. */}
          {active === item.id && (
            <motion.span
              layoutId="settings-section-active"
              transition={spring}
              className="absolute inset-0 rounded-md bg-selected"
            />
          )}
          <span className="relative">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
