import { useState, type RefObject } from "react";
import { useStore } from "@/stores/app-store";
import { usePaletteItems } from "@/features/palette/hooks/usePaletteItems";
import { usePaletteNavigation } from "@/features/palette/hooks/usePaletteNavigation";

export function usePaletteDialog(list: RefObject<HTMLElement | null>) {
  const setPalette = useStore((s) => s.setPalette);
  const [query, setQuery] = useState("");
  const items = usePaletteItems(query);
  const { current, setActive, onKeyDown } = usePaletteNavigation(items, list);

  return {
    query,
    items,
    current,
    hover: setActive,
    onKeyDown,
    close: () => setPalette(false),
    search: (text: string) => {
      setQuery(text);
      setActive(0);
    },
  };
}
