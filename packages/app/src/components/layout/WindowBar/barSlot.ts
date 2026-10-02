import { createContext, useContext } from "react";

/** The window bar's content area, once it has mounted. Views move their headers into it. */
export const BarSlotContext = createContext<HTMLElement | null>(null);

export const useBarSlot = () => useContext(BarSlotContext);
