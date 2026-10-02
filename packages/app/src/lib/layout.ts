/** The app never lays out narrower than this; below it the page scrolls sideways. */
export const MIN_APP_WIDTH = 1100;

/** Where the first thing after the window bar's own controls may start: the buttons, the sidebar toggle, and air. */
export const WINDOW_BAR_CLEARANCE = 136;

/** What a view's header leaves to the window controls: whatever of the clearance the sidebar doesn't already cover. */
export const barInset = (sidebarWidth: number) => Math.max(0, WINDOW_BAR_CLEARANCE - sidebarWidth);
