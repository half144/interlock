import { useState, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";
import { useHotspots } from "@/features/workspace/hooks/useHotspots";
import { DescribePanel } from "./DescribePanel/DescribePanel";

interface VisualEditProps {
  rootRef: RefObject<HTMLDivElement | null>;
  agent: Agent;
}

/** Point at part of the running app and say what should change; the request goes to the agent. */
export function VisualEdit({ rootRef, agent }: VisualEditProps) {
  const spots = useHotspots(rootRef);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <>
      <div className="absolute inset-0 z-10 cursor-crosshair" onClick={() => setSelected(null)}>
        {spots.map((s, i) => (
          <button
            key={s.name}
            type="button"
            aria-label={`Select ${s.name}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(i);
            }}
            style={s.box}
            className={cn(
              "group absolute rounded-md outline-2 outline-offset-2 transition-[outline-color] duration-150",
              selected === i
                ? "outline-run"
                : "outline-transparent outline-dashed hover:outline-run",
            )}
          >
            <span
              className={cn(
                "absolute -top-6 left-0 rounded-[4px] bg-run px-1.5 py-0.5 font-mono text-[10.5px] text-white transition-opacity",
                selected === i ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}
            >
              {s.tag}
            </span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {selected !== null && spots[selected] && (
          <DescribePanel
            key={spots[selected].name}
            spot={spots[selected]}
            agent={agent}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
