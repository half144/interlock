import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { fadeIn, spring } from "@/lib/motion";
import { surface } from "@/lib/styles";
import { Button } from "@/components/ui/Button/Button";
import { Collapse } from "@/components/ui/Collapse/Collapse";
import { AutomationRow } from "./AutomationRow/AutomationRow";
import { NewAutomation } from "./NewAutomation/NewAutomation";

export function AutomationsView() {
  const all = useStore((s) => s.automations);
  const toggleAutomation = useStore((s) => s.toggleAutomation);
  const addAutomation = useStore((s) => s.addAutomation);
  const [composing, setComposing] = useState(false);
  const active = all.filter((a) => a.enabled).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1040px] px-8 pt-8 pb-16">
        <header className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="flex items-baseline gap-2 font-serif text-[24px] text-ink">
              Automations
              <span className="text-[13px] font-normal tracking-normal tabular-nums text-ink-3">
                {active} of {all.length} active
              </span>
            </h1>
            <p className="mt-1 text-[13px] text-ink-3">
              Agents that start themselves on a schedule or an event. Every run opens a thread in
              its project's sidebar.
            </p>
          </div>
          {!composing && (
            <Button variant="primary" icon={<Plus />} onClick={() => setComposing(true)}>
              New automation
            </Button>
          )}
        </header>

        <Collapse open={composing}>
          <div className="pt-6">
            <NewAutomation
              onCancel={() => setComposing(false)}
              onCreate={(a) => {
                addAutomation(a);
                setComposing(false);
              }}
            />
          </div>
        </Collapse>

        <div className={cn("mt-6 divide-y divide-seam shadow-card", surface.frame)}>
          <AnimatePresence initial={false}>
            {all.map((a) => (
              <motion.div
                key={a.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  transition: { height: spring, opacity: fadeIn },
                }}
                style={{ overflow: "hidden" }}
              >
                <AutomationRow automation={a} onToggle={() => toggleAutomation(a.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
