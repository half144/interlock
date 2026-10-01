/**
 * Class recipes for things the app draws in more than one place. Reach for these instead of
 * re-typing a surface, so a card or a menu can't drift from its siblings.
 */

/** The feedback every pressable control shares: colours ease, and the control dips while it's held. */
export const pressable =
  "transition-[color,background-color,border-color,box-shadow,scale] duration-150 ease-out-quint";

export const surface = {
  /** A card lifted off the page: checkpoint, delegation, live view, the workspace shell. */
  card: "rounded-2xl border border-seam bg-raised shadow-card",
  /** A framed area that stays on the page: settings sections, lists, workspace tab frames. */
  frame: "rounded-xl border border-seam bg-raised",
  /** Anything floating over content: menus, popovers, the palette, toasts. */
  overlay: "border border-seam-2 bg-overlay shadow-overlay",
  /** Every composer's shell. Focus is carried by the whole container, not the textarea. */
  composer:
    "rounded-[22px] border border-seam bg-raised shadow-composer transition-shadow focus-within:shadow-[0_0_0_1px_rgb(255_255_255/0.12),0_12px_32px_-12px_rgb(0_0_0/0.6)]",
};

/**
 * Every form field, after Manus: a soft fill a step lighter than the surface it sits on, no outline at rest,
 * 8px corners. Focus draws a quiet run-blue edge instead of a glow.
 */
export const field =
  "rounded-lg border border-transparent bg-hover text-[13.5px] text-ink placeholder:text-ink-3 transition-[border-color,background-color] duration-150 focus:border-run/50 focus:outline-none";

/** A field's label: bright and medium, so the form reads label first. */
export const fieldLabel = "text-[13px] font-medium text-ink";

/** Literal values (paths, commands, keys, branches) set in mono, a half-step under body text so they don't shout. */
export const monoText = "font-mono text-[12.5px]";

/** The selected segment of a segmented control: a raised chip with a hairline ring. */
export const segment =
  "bg-raised shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_1px_2px_rgb(0_0_0/0.3)]";
