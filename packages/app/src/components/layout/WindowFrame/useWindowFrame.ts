import { useState } from "react";

export function useWindowFrame() {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  return { slot, setSlot };
}
