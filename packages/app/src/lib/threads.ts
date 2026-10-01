import type { Thread } from "@/types";

/** Orders threads by most recent activity first, as the sidebar and the palette list them. */
export const byRecentActivity = (a: Thread, b: Thread) => b.updatedAt - a.updatedAt;
