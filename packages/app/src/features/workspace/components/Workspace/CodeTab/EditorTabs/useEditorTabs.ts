import { useEffect, useRef, type WheelEvent } from "react";

export function useEditorTabs(active: string | null) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [active]);

  const scrollSideways = (event: WheelEvent<HTMLDivElement>) => {
    if (event.deltaX === 0) event.currentTarget.scrollLeft += event.deltaY;
  };

  return { listRef, scrollSideways };
}
