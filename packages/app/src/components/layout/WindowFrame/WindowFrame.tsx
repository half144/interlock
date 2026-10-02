import type { ReactNode } from "react";
import { MIN_APP_WIDTH } from "@/lib/layout";
import { macChrome } from "@/platform/desktop";
import { BarSlotContext } from "../WindowBar/barSlot";
import { WindowBar } from "../WindowBar/WindowBar";
import { useWindowFrame } from "./useWindowFrame";

/** The window: on a Mac one bar across the top, whose controls and view headers sit in the window's title bar, and the app beneath it. */
export function WindowFrame({ children }: { children: ReactNode }) {
  const { slot, setSlot } = useWindowFrame();

  return (
    <BarSlotContext.Provider value={slot}>
      <div className="flex h-full flex-col" style={{ minWidth: MIN_APP_WIDTH }}>
        {macChrome && <WindowBar slotRef={setSlot} />}
        <div className="flex min-h-0 flex-1">{children}</div>
      </div>
    </BarSlotContext.Provider>
  );
}
