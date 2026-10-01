import { fadeIn, fadeOut } from "@/lib/motion";

/** Words leave at once so you never watch them get cropped; they come back once there's room for them. */
export const foldTransition = (show: boolean) => (show ? { ...fadeIn, delay: 0.2 } : fadeOut);
