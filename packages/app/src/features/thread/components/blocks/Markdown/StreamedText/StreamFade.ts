import { createContext } from "react";

/** True while a reply is streaming and its words should fade in as they arrive. */
export const StreamFade = createContext(false);
