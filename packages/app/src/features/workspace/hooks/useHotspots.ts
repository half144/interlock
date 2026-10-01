import { useLayoutEffect, useState, type RefObject } from "react";
import { measureHotspots, type Hotspot } from "@/features/workspace/utils/hotspots";

/** The editable regions of the rendered preview, re-measured whenever the preview resizes. */
export function useHotspots(rootRef: RefObject<HTMLDivElement | null>) {
  const [spots, setSpots] = useState<Hotspot[]>([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => setSpots(measureHotspots(root));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef]);

  return spots;
}
