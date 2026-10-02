export interface SidebarToggle {
  label: string;
  action: "restore" | "open" | "rail";
}

/** The review maximized has no sidebar to show, so the toggle brings the normal layout back instead. */
export function sidebarToggle(maximized: boolean, folded: boolean): SidebarToggle {
  if (maximized) return { label: "Restore layout", action: "restore" };
  return folded
    ? { label: "Expand sidebar", action: "open" }
    : { label: "Collapse sidebar", action: "rail" };
}
