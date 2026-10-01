import { ChevronDown, ChevronRight } from "lucide-react";
import type { Hotspot } from "@/features/workspace/utils/hotspots";
import { Swatch } from "./Swatch/Swatch";

const MORE = ["Border", "Display"];

export function StyleProperties({ spot }: { spot: Hotspot }) {
  return (
    <div className="pb-1">
      <div className="px-3 pt-3 pb-2">
        <p className="flex items-center justify-between text-[13px] font-medium text-ink">
          Colors <ChevronDown className="size-3.5 text-ink-3" />
        </p>
        <Swatch label="Background" value={spot.background} />
        <Swatch label="Text" value={spot.color} />
      </div>
      {MORE.map((row) => (
        <button
          key={row}
          type="button"
          className="flex h-10 w-full items-center justify-between border-t border-seam px-3 text-[13px] text-ink hover:bg-hover"
        >
          {row}
          <ChevronRight className="size-3.5 text-ink-3" />
        </button>
      ))}
    </div>
  );
}
