---
name: Interlock
description: Coding-agent orchestrator in soft graphite. Light ink for action, colour only for state, motion only where something actually changes.
colors:
  ground: "#1d1d1c"
  panel: "#262625"
  inset: "#2c2c2b"
  raised: "#313130"
  overlay: "#333332"
  raised-2: "#383837"
  seam: "rgb(255 255 255 / 0.08)"
  seam-2: "rgb(255 255 255 / 0.13)"
  hover: "rgb(255 255 255 / 0.05)"
  selected: "rgb(255 255 255 / 0.09)"
  ink: "#ececeb"
  ink-2: "#c4c3bf"
  ink-3: "#9c9b96"
  ink-4: "#6f6e6a"
  run: "#6aa4ff"
  hold: "#f2a65a"
  ready: "#5cc08f"
  merge: "#b293f5"
  red: "#f0756b"
  green: "#5cc08f"
  add: "#3fb950"
  del: "#f85149"
  syn-keyword: "#ff7b72"
  syn-string: "#a5d6ff"
  syn-number: "#79c0ff"
  syn-comment: "#8b949e"
  syn-fn: "#d2a8ff"
  syn-type: "#ffa657"
  syn-tag: "#7ee787"
typography:
  display:
    fontFamily: "Libre Baskerville, Georgia, Times New Roman, serif"
    fontSize: "34px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Libre Baskerville, Georgia, Times New Roman, serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: "Libre Baskerville, Georgia, Times New Roman, serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.375
  wordmark:
    fontFamily: "Libre Baskerville, Georgia, Times New Roman, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
  heading:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter Variable, Segoe UI, ui-sans-serif, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.5
  body-large:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter Variable, Segoe UI, ui-sans-serif, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter Variable, Segoe UI, ui-sans-serif, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter Variable, Segoe UI, ui-sans-serif, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
  meta:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter Variable, Segoe UI, ui-sans-serif, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
  tray:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Inter Variable, Segoe UI, ui-sans-serif, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "Geist Mono Variable, ui-monospace, SF Mono, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: "Geist Mono Variable, ui-monospace, SF Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "20px"
  id:
    fontFamily: "Geist Mono Variable, ui-monospace, SF Mono, monospace"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
rounded:
  xs: "4px"
  sm: "5px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  composer: "22px"
  full: "9999px"
spacing:
  2xs: "2px"
  xs: "6px"
  sm: "8px"
  icon-gap: "10px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  message-gap: "28px"
  page: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "#ffffff"
  button-primary-active:
    backgroundColor: "{colors.ink-2}"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.raised-2}"
  button-ghost:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "36px"
  button-ghost-hover:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.ink}"
  button-danger:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.red}"
    rounded: "{rounded.lg}"
    height: "36px"
  icon-button:
    textColor: "{colors.ink-3}"
    rounded: "{rounded.md}"
    size: "28px"
  icon-button-hover:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.ink}"
  round-button-solid:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.full}"
    size: "32px"
  round-button-solid-disabled:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.ink-4}"
  round-button-outline:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.full}"
    size: "32px"
  composer:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body-large}"
    rounded: "{rounded.composer}"
    padding: "16px 20px 4px"
  composer-tray:
    backgroundColor: "{colors.inset}"
    textColor: "{colors.ink-3}"
    typography: "{typography.tray}"
    rounded: "{rounded.2xl}"
  worktree-strip:
    backgroundColor: "{colors.inset}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
  effort-pill:
    backgroundColor: "rgb(255 255 255 / 0.06)"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.full}"
    height: "32px"
    padding: "0 12px"
  card:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.2xl}"
  frame:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.xl}"
  overlay:
    backgroundColor: "{colors.overlay}"
    rounded: "{rounded.lg}"
    padding: "4px"
  menu-item:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    height: "32px"
  menu-item-active:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.ink}"
  nav-item:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: "36px"
  nav-item-active:
    backgroundColor: "{colors.selected}"
  tabs:
    backgroundColor: "{colors.hover}"
    rounded: "{rounded.md}"
    height: "28px"
  tab-active:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  toggle-on:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.full}"
    width: "32px"
    height: "18px"
  toggle-off:
    backgroundColor: "{colors.selected}"
    rounded: "{rounded.full}"
    width: "32px"
    height: "18px"
  kbd:
    backgroundColor: "{colors.hover}"
    textColor: "{colors.ink-3}"
    rounded: "{rounded.xs}"
    height: "18px"
---

# Design System: Interlock

## Overview

**Creative North Star: "The Calm Handoff"**

Interlock hands a coding task to an agent the way you would hand it to a capable colleague: a quiet page, one question, then a readable account of what it did and a window into its machine. The system is dark only (`color-scheme: dark`): warm soft graphite in a few close steps, light warm ink for text and for the one action that matters, colour only where state lives, and a single serif voice for the moments that address a person. Everything else is the platform's own UI sans; anything a machine named is Geist Mono.

The lineage is pinned and should be read as four bounded jobs, never averaged together:

- **Manus (dark) owns the world.** Serif question over a centered composer, tasks in the sidebar, the agent's steps as collapsible lines, a "computer" for what the agent is doing that opens a workspace beside the chat. Mid graphite, never black.
- **T3 Code owns the composer's edges.** Context lives in a narrower strip tucked under the composer so it reads as cut off by it (branch, worktree, subagents), and in a matching strip tucked behind its top (the worktree's current step). Nothing floats above the composer as a free pill.
- **Family owns the magic.** Delight is continuity, not decoration: a control stretches into its own surface and folds back (the effort pill), text swaps in place with a short blur, highlights slide instead of blinking. No glow, no equaliser, no flourish that would survive being muted.
- **Linear owns the restraint.** Depth by tone and hairlines, capsule pills, compact type, colour as signal.

Confirmed rejections from this project's history: the themed railway concept, the dense near-black dashboard, multi-agent arenas (best-of-N, compare), a floating status pill above the composer, and the "AI-slop" equaliser-with-glow effort dial.

**Key Characteristics:**

- Soft graphite ladder: Ground sidebar, Panel page, Raised cards and composer, Overlay for floating layers, Inset wells.
- Light Ink is the action colour; there is no blue primary.
- Libre Baskerville in named seats only; UI sans everywhere else; Geist Mono for machine text.
- The composer is the centre of gravity, with a strip behind it and a tray under it.
- One reading width (700px) alone; a 40/60 split when the workspace opens, docked on one spring.
- Motion explains state, continuity or feedback, or it doesn't exist.

## Colors

Warm neutral graphite with light warm ink; saturated colour appears only where state lives.

### Primary

- **Light Ink** (#ececeb): the action colour and the primary text. Primary buttons, the round send and stop buttons, a switched-on toggle. Glyphs on ink are Ground. Hover brightens to pure white, press dims to Ink 2, disabled drops to 25%.

### Secondary (status)

- **Run Blue** (#6aa4ff): what is live or new. A running agent's spinner and live-view tile, the focus ring (60% alpha), text selection (30%), the attention dot on an unopened Create PR, visual-edit outlines. Never a button fill.
- **Hold Amber** (#f2a65a): an agent waiting on a human. Hold card disc, its status line, the pulsing held glyph, sidebar alerts.
- **Ready Green** (#5cc08f, also `green`): ready for review, answered, passed checks, a finished plan's check on the worktree strip, and the "Ready for review" outcome line.
- **Merge Violet** (#b293f5): merged tasks and PRs only. It is not an accent and never decorates.
- **Signal Red** (#f0756b): failed, and destructive actions.

### Tertiary (diff and syntax)

- **Diff Add / Diff Delete** (#3fb950 / #f85149): `+`/`−` counts and 10% row washes in diffs.
- **Syntax set** (`syn-keyword` #ff7b72, `syn-string` #a5d6ff, `syn-number` #79c0ff, `syn-comment` #8b949e, `syn-fn` #d2a8ff, `syn-type` #ffa657, `syn-tag` #7ee787): GitHub-dark highlighting inside code surfaces only.
- **Git Modified** (`mod` #e2c08d) with Diff Add: the git decoration on changed files in the explorer (name and letter) and the letter on editor tabs. Nowhere outside the review editor.
- **File marks** (`lang-ts` #6aa0d6, `lang-sql` #d790b8, `lang-json` #d4b961, `lang-md` #8ea6c6): the short file-type glyph (TS, SQL, {}, M↓) before a file name in the explorer, tabs and breadcrumbs. Never a fill or a UI accent.

### Agent marks

- Each CLI is identified by its vendor's mark (Claude, OpenAI) drawn in monochrome ink, never in brand colour. Colour next to a mark always means state (warning amber, danger red, from the provider's own `tone`), so identity and state never compete.

### Neutral

- **Ground** (#1d1d1c): sidebar and rail, settings inputs, text on ink, cut-outs inside status glyphs.
- **Panel** (#262625): the page behind every view; the workspace's inner gutter; the body background.
- **Raised** (#313130) and **Overlay** (#333332): cards, composer, user bubble, workspace shell, frames and dialogs; Overlay for menus, popovers, palette, toasts, the effort menu. **Raised 2** (#383837) is their hover.
- **Inset** (#2c2c2b): wells that sink inside a card, and both composer strips (the worktree strip and the tray).
- **Seam / Seam 2** (8% / 13% white): hairlines. Seam outlines cards, pills, strips and dividers; Seam 2 rings floating layers and secondary buttons.
- **Hover / Selected** (5% / 9% white): row and pill hover; the current nav item, task, tab, menu item.
- **Ink 2 / Ink 3** (#c4c3bf / #9c9b96): secondary text and icons, meta, hints, group labels.
- **Ink 4** (#6f6e6a): marks that aren't reading text: line numbers, pending rings, placeholders, disabled states.

### Named Rules

**The Ink Not Accent Rule.** Action is light ink on graphite. A primary button, send and stop are ink with Ground glyphs; buttons are never blue, violet or tinted.

**The Colour Means State Rule.** Chrome stays ink on graphite. Colour appears only for agent status, diff, syntax, focus, selection, run blue for what is live, and a usage window running out (amber, then red). Navigation and selection are white alpha washes.

**The Syntax Stays Home Rule.** `syn-*`, `add` and `del` live inside code and diff surfaces. They never signal app state, and status colours never appear inside code.

**The No Glow Rule.** No coloured shadow, bloom, neon, gradient fill or blurred colour blob anywhere. The only blurs in the system are neutral: the dock's progressive backdrop blur and the 6px blur behind a dialog.

## Typography

**Display Font:** Libre Baskerville (with Georgia, Times New Roman)
**Body Font:** System UI sans: -apple-system / SF Pro Text (with Inter Variable, Segoe UI)
**Label/Mono Font:** Geist Mono Variable (with ui-monospace, SF Mono)

**Character:** A bookish serif speaks only when a person is being addressed or asked to decide; the native OS sans does all the operating, so the app reads like a calm document rather than a console. Geist Mono marks what a machine produced.

### Hierarchy

- **Display** (400, 34px, 1.25, -0.01em): the home question "What should we build?".
- **Headline** (400, 24px, 1.5): page titles (Automations, project settings).
- **Title** (700, 17px, 1.375, balanced): the decision a hold card asks for; dialog titles take this size in the UI sans at 600.
- **Wordmark** (400, 17px in the sidebar, 16px above each agent message): "interlock" beside the two-ring mark.
- **Heading** (500, 16px): the top-bar model picker.
- **Body large** (400, 15px, 1.65 prose / 1.6 bubble): chat prose, user messages, composers, palette search.
- **Body** (400, 14px, 1.5): default UI text: sidebar rows, follow-ups, step titles at 14.5px/500.
- **Label** (500, 13px, Ink 3, sentence case): group labels ("Projects", "All tasks"), menu rows at 13–13.5px.
- **Meta** (400, 12.5–13px, Ink 3): status lines, hints, sub-lines, segmented tabs at 500.
- **Tray** (400, 12px, Ink 3): everything inside the composer tray; branch at 11px mono.
- **Mono** (Geist Mono 12.5px): branches, commands, paths, PR links. Diff rows 12px on a 20px line; IDs and per-file counts 11.5px at -0.01em; hunk headers and terminal tabs 11px.
- **Kbd** (sans 500, 11px, Ink 3).

Numbers that update or align (counts, costs, progress, elapsed time) are tabular.

### Named Rules

**The Named Seats Rule.** Libre Baskerville appears only in: the home display line, page headlines, hold-card decisions, the wordmark, and the sidebar tracker card title. Buttons, labels, body, nav and data are never serif, and no headline swaps a single word into serif, italic or colour for "taste".

**The Machine Text Rule.** If a machine named it (agent ID, branch, path, command, diff count, cron, PR link, model id), set it in Geist Mono; prose stays in the UI sans.

**The Sentence Case Rule.** Labels are sentence case with no added letter-spacing. No uppercase, no tracked-out eyebrows.

## Layout

A fixed desktop app shell with no breakpoints: the app holds a 1100px minimum width, the body never scrolls, each view scrolls its own column.

- **Sidebar ↔ rail:** one sidebar, 264px on Ground, that folds to a 52px icon rail. It folds when you collapse it, and on its own while a task's workspace is open (`useRail`); opening the workspace hands a manually expanded sidebar back to auto. Icons sit on a fixed 26px centre line in both states, so while the width closes they stay put; labels and lists fade out at once and return only once there's room. Rows are 36px with 2px gaps inside an 8px gutter.
- **macOS window chrome:** in the desktop app on a Mac the title bar is transparent (`titleBarStyle: Overlay`, no title) and our own **window bar** takes its place, after Codex and Cursor: one 48px strip across the whole window, draggable, `ground` with a Seam hairline under it. The window buttons float over its left end at x 16 / y 26 in Tauri's `trafficLightPosition`, which centres them in the 48px bar on macOS 26 (`--spacing-lights`, 92px reserved; they run to about 76px on macOS 26), the sidebar toggle sits right after them, and everything else in the bar is a view's own header moved up into it: the title and actions of a page, the chat's title over the chat, the workspace tabs over the workspace. The sidebar, chat and panel start below the bar, and each header is offset by whatever the sidebar does not already cover of the first 136px (`WINDOW_BAR_CLEARANCE`), so nothing, in any layout, can sit under the window buttons or the toggle. The wordmark and version badge stay on the sidebar's first row, under the bar. In the maximized review the toggle brings the normal layout back. Gated on `data-chrome="mac"` and the bar slot being mounted; the browser build and other platforms render exactly as before.
- **Main bar:** 52px, 16px side padding. Model picker or title left; task actions, notifications, the usage pill (each provider's mark and what is left of its tightest window) and avatar right. Compact while the workspace is open. On a Mac it lives in the window bar instead of under it.
- **Home:** one centered column, max 720px, 24px gutters, starting 15vh from the top: headline, composer 32px below with its worktree tray, the project's skills 16px below, then "Waiting on you" 48px below. Everything on it is real: no connector nudges, no generic intents, no integrations we don't have.
- **Thread alone:** one reading column, **700px** wide (`READING_WIDTH`), 24px gutters. 28px between turns, 12px between blocks of a turn. The worktree strip, composer and tray dock at the bottom of the same column.
- **Thread with workspace:** the chat narrows to **40%** of the main area (clamped 420–580px) and the workspace takes the other **60%**, inset 8px top/bottom/right so it floats as a card. The conversation's reading width animates from 700px to the chat width on the same spring, so it slides as a block.
- **Code tab as an editor:** it follows VS Code's anatomy so a developer reads it without learning it: an explorer (uppercase project header, 22px rows, file-type marks, git colours and letters, a dot on folders holding changes), editor tabs (single click previews in italics, double click pins, middle click closes; the active tab is Raised and slides on `spring`), breadcrumbs down to the class or function, and the file's diff as before (old and new line numbers, sign, 10% row washes, the `@@` hunk header). No per-change Keep / Undo: the agent writes in its own worktree, so the decision is the PR, line comments or the chat, not each hunk. Chrome stays Interlock: graphite surfaces (explorer and tab strip Inset, editor Raised), our overlays, our motion; no VS Code blue.
- **Maximized review (mini-IDE):** only the Code tab can maximize. The sidebar steps out (width 0); the workspace card loses its corners, shadow and gutters on the layout's timing and sits flush at the left edge, its explorer widening from 220 to 280px; the chat docks on the right at 25% (clamped 340–420px) as a side pane with a hairline edge, its title (the chat switcher) on the toolbar's row, and without the worktree strip and tray. A 24px Ground status bar rises under both: branch, checks and the agent's status line on the left; files changed, indentation, encoding, line endings and language on the right. Picking another active chat, restoring, Esc or leaving the Code tab returns to the normal layout. The chat never crosses the review visibly: it fades out in place, travels unseen, and fades in as it settles, while the review slides over on the same `dock` spring.
- **The dock:** sidebar width, chat width and the workspace's edge all ride one spring (`dock`, 0.3s, no bounce) and start on the same frame. The workspace is laid out at its final width from the first frame and is pinned to the chat's edge, so it slides in whole and never reflows mid-flight. Window resizes follow instantly, without animation.
- **Pages:** Automations max 1040px, Settings max 1100px, 32px padding; Settings pairs a 180px sticky section nav with an 880px column.
- **Floating:** palette 620px wide, 14vh from the top; dialogs 440px, centred. Both sit on `Backdrop`: after Manus, the app dims to 45% black and blurs 6px out of focus behind them. Toasts bottom-right, 16px from the edges, 320px wide.

The rhythm is Tailwind's 4px grid, mostly 2 / 6 / 8 / 10 / 12 / 16 / 20 / 24 / 28 / 32px.

## Elevation & Depth

Tonal first, shadow second. Surfaces get lighter as they come forward (Ground → Panel → Raised → Overlay) and wells sink back (Inset). Soft, dark, diffuse shadows separate cards from the page; floating layers add a faint white ring. There is no glow and no coloured shadow.

### Shadow Vocabulary

- **Button** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.3)`): primary and secondary buttons, the user bubble.
- **Card** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.25), 0 8px 24px -10px rgb(0 0 0 / 0.45)`): checkpoint, delegation and hold cards, live view, workspace shell, worktree thumbnail, settings sections.
- **Composer** (`box-shadow: 0 1px 2px rgb(0 0 0 / 0.3), 0 12px 32px -12px rgb(0 0 0 / 0.55)`): every composer. On focus-within: `0 0 0 1px rgb(255 255 255 / 0.12), 0 12px 32px -12px rgb(0 0 0 / 0.6)`.
- **Overlay** (`box-shadow: 0 0 0 1px rgb(255 255 255 / 0.06), 0 16px 40px -10px rgb(0 0 0 / 0.65), 0 2px 6px rgb(0 0 0 / 0.3)`): menus, effort menu, slash menu, palette, toasts, PR popover and dialog.
- **Segment** (`box-shadow: 0 0 0 1px rgb(255 255 255 / 0.08), 0 1px 2px rgb(0 0 0 / 0.3)`): the selected segment of a segmented control.
- **The dock fade:** the band just above a docked composer blurs (0.5 → 4px, progressive masks) and then darkens to the surface colour over 40px, so scrolled content softens instead of being cut at a hard edge. Neutral only.

### Named Rules

**The Lighter Means Nearer Rule.** A surface comes forward by getting lighter, with a Seam outline and the Card shadow. Nothing comes forward by glowing.

**The Wells Go Down Rule.** Inside a card, secondary content recedes into Inset wells instead of adding another raised layer. Cards are never nested in cards.

## Shapes

Soft, rounded geometry with no sharp corners in the chrome. Corners grow with the surface: 4px keys and branch tags, 5px menu items and tab segments, 6px icon buttons and inputs, 8px buttons, nav rows and menus, 10px effort-menu rows, 12px frames, popovers, palette and toasts, 16px cards, the workspace shell, the user bubble and both composer strips, 20px dialogs, 22px the composer. Chips, composer pills, round actions, toggles, avatars and progress bars are full pills or circles. Borders are 1px white-alpha hairlines; the strips drop the border on the side the composer covers.

## Components

The shared primitives live in `src/components/ui`; class recipes for repeated surfaces live in `src/components/ui/styles.ts` (`pressable`, `surface.card`, `surface.frame`, `surface.overlay`, `surface.composer`, `segment`). Reach for them before drawing a surface again.

### Buttons

- **Button** (`Button`): 8px corners; `md` 36px / 14px padding / 13.5px, `sm` 28px / 12px / 13px; 14px icons. Variants: **primary** (ink, one per region), **secondary** (Raised, Seam 2 border, hover Raised 2), **ghost** (Ink 2 text, hover Selected), **danger** (red text, hover 10% red wash).
- **IconButton** (`IconButton`): 28px square, 6px corners, Ink 3 glyph; hover Selected. `label` is required and becomes the accessible name and tooltip; `active` holds the Selected state.
- **RoundButton** (`RoundButton`): 32px circle; `solid` (ink), `outline` (Seam ring), `ghost`. Used around composers and in the top bar.
- **SendButton** (`SendButton`): every composer's send, a solid round button with an up-arrow, disabled until there's text. While an agent runs and the composer is empty, the thread composer swaps it in place for Stop (an ink circle with a Ground square).
- **Feedback:** all pressables share `pressable` (150ms colour/background/border/shadow, ease-out-quint) and dip while held: 0.97 for labelled buttons, 0.92 for icon and round buttons.

### Chips and pills

- **Composer pills:** 32px full pills with a Seam outline, 13px ink text, 14px Ink 2 icon (project picker). "Plan first" is a borderless text pill: Ink 3 at rest, Selected and ink when on.
- **Skill pills:** 28px Seam-outlined pills under the home tray, the project's skills in 12px mono (`/a11y-audit`). Picking one writes `/skill ` at the start of the prompt as plain text, replacing a skill already there; nothing is armed or locked.
- **Waiting on you:** a placard and up to the tasks blocked on a person, across projects: held (the question or approval as the line), failed, then ready for review (with its diff stat). 44px rows: Lamp, line, detail in Ink 3, project in Ink 4. With nothing waiting it says so in one Ink 3 line and how many agents are working.
- **Version badge:** an 18px Seam-outlined pill beside the sidebar wordmark, `v0.1.0` in 10.5px mono Ink 4. Its tooltip names the build: the commit for a built app, "development build" under the dev server. It folds away with the wordmark.
- **Tool chips:** 28px pills on Inset, 13px Ink 2 with an Ink 3 tool glyph.

### Cards and frames

- **Card** (`surface.card`): Raised, 16px corners, Seam, Card shadow. For things the agent hands you: checkpoint, delegation, hold, live view; and the workspace shell. Clickable cards hover to Raised 2.
- **Frame** (`surface.frame`): Raised, 12px corners, Seam, no shadow. For framed areas that belong to the page: settings sections, lists, workspace tab frames.
- **Modal** (`Modal` on `Backdrop`): Raised, 20px corners, Seam, Overlay shadow, 440px. Manus's anatomy: a 17px/600 title with a close button on top, the content, then actions bottom-right (secondary, then primary). Escape, the close button or a click on the backdrop dismisses it.
- A card is justified only when the user acts on the container. Otherwise use rows, dividers or a well.

### The composer (signature)

Three stacked pieces that read as one object:

1. **Worktree strip** (behind the composer's top): plan progress, and only that. It exists while the turn on screen has a plan (Claude's task list, Codex's `update_plan`); a turn without one has no strip, and an earlier turn's plan never carries over. When the plan arrives it rises out from behind the composer (height and tuck grow together on `spring`, so the composer never moves) and sinks back the same way. An Inset strip with 16px top corners, inset 8px from the composer's sides and tucked 16px under it. One line by default: the current step with its status mark, `done / total` and a chevron. A second line appears only when the strip is the one saying it: a shimmering "Thinking" while the step it shows is in progress, or the amber "… is waiting for you". Never a generic status ("is working", "is idle", "finished"): the conversation says those. A small terminal thumbnail (64×44px, 8px corners, Card shadow) pokes up out of its top-left edge and opens the worktree. Expanded, it lists the plan; finished, it settles to one quieter line with a green check (violet merge once merged), the last step and `n / n`. The outcome ("Ready for review", "Merged as #N") is said once, in the conversation.
2. **Composer** (`surface.composer`): Raised, 22px corners, Composer shadow, `relative z-10` so it covers both strips' tucked edges. 15px text, 20px side padding, Ink 4 placeholder. Bottom toolbar: round add-files on the left; effort pill, dictate and send on the right.
3. **Composer tray** (`ComposerTray`, under the composer): a narrower Inset strip (24px inset each side, 16px bottom corners, no top border) tucked 16px under the composer, 12px Ink 3 text. In a thread it holds subagent chips (24px pills; the selected chip's background slides between them) and, on the right, the PR number and branch in 11px mono. On home it says where the task will run: "New worktree from" and the starting branch (a picker: the default branch or a branch another task is still working on, in 11.5px mono), with the project's stack on the right.

### Effort pill and menu

The reasoning-effort control, next to Send. At rest: a 32px pill on a 6% white wash with four 4px dots filled to the level and the level's name. Pressed, the pill itself stretches up into a 264px Overlay menu (shared layout morph, `morph` spring) anchored to its bottom-right: a "Reasoning · model" header, four 36px rows (dots ladder, label, check on the current level) with a Selected highlight that slides to the pointer or arrow keys, and a footer that explains the focused level without changing row heights. Picking folds the menu back into the pill, and the new label blurs in.

### Dock (`Dock`)

Pins a composer to the bottom of its scroll area with the dock fade above it. `surface` must match the scroll area's background (`panel` in the thread, `raised` inside the workspace).

### Navigation

- **Sidebar rows:** 36px, 8px corners, 14px ink text, 16px Ink 2 icon at a 10px gap. Hover 5% wash; current view 9% Selected; the selected task's highlight slides between rows.
- **Segmented tabs** (`Tabs`): 28px on the Hover wash with 2px padding; segments 12.5px/500, Ink 3 at rest; the selected segment is `segment` and slides to the new tab.
- **Menus** (`Popover` + `MenuItem`): `surface.overlay`, 8px corners, 4px padding; 32px rows at 13px Ink 2 with Ink 3 icons, Selected on hover or active, optional right hint. They grow out of their trigger (origin on the trigger's side).
- **Command palette:** 52px search row at 15px, grouped 40px rows, a 40px key-hint footer. Row highlight is instant.

### Agent message and steps

The agent speaks under its 16px serif wordmark, not an avatar bubble. Prose at 15px/1.65 with inline `code` on an 8% white wash. Steps are collapsible plan lines: a 16px status mark (pending Ink 4 ring, running run-blue spinner, done Ink 3 disc with a check that lands with a short scale-in), a 14.5px/500 title, and a body hanging from a 1px Seam rail with detail prose and tool chips. The user's turn is a right-aligned Raised bubble (max 85%, 16px corners, Seam, Button shadow).

**Thinking line.** While a turn runs, the reply ends in a 14px shimmering line (the running-status shimmer on Ink 3): "Claude Code is thinking" (the agent's own name) under an empty reply, which is on screen, wordmark included, from the moment the prompt is sent; "Thinking" once the reply has content. It gives way while a plan step is in progress (the step's spinner and the worktree strip say it), says "… will start soon" while the agent is queued, and is gone when the turn ends or waits on you. It fades up 4px on arrival and leaves by collapsing, taking the 12px block gap with it so the reply doesn't jump.

### Workspace

The agent's computer beside the chat: `surface.card` inset 8px from the view edges. A 48px toolbar with icon tabs (the active one expands to icon + label on a sliding Selected background), then Panel gutter with each tab in a 12px frame: Preview (device switch, path bar, live app), Code (file tree + diff), Terminal, Checks, Agents (subagent tree + subagent chat). Content mounts just after the panel starts moving, then fades in.

### Status glyphs, IDs and agent marks

- **Lamp** (`Lamp`): 14–16px SVG status glyphs in the status colours; a new state pops in, a first render doesn't. Cut-outs use Ground.
- **Describer** (`Describer`): the agent ID in 11.5px mono Ink 3, struck through when discarded.
- **AgentMark** (`AgentMark`): the provider's mark in monochrome ink, 14px by default; `className` sizes the slot and the glyph fills 80% of it. Paths come from Paseo (Apache-2.0); the marks are their owners' trademarks, used only to say which CLI runs.

### Toggle, Kbd, EmptyState

- **Toggle:** 32×18px pill; on is an ink track with a Ground knob, off is Selected with a Seam 2 ring; the knob moves on `spring`.
- **Kbd:** 18px key on the Hover wash, Seam border, 4px corners, 11px/500 Ink 3.
- **EmptyState:** a 24px Ink 2 icon, 15px/500 title, 13.5px Ink 3 description (max 340px), optional small secondary button.

### Motion system

Tokens live in `src/lib/motion.ts` (and `--ease-out-quint` in CSS). Every animation uses them.

- `easeOut` (0.23, 1, 0.32, 1) for arrivals; `easeIn` (0.4, 0, 1, 1) for departures.
- `fadeIn` 0.18s, `fadeOut` 0.11s: exits always run faster than entrances.
- `spring` (0.26s, no bounce): state changes, sliding highlights, toggles, small swaps.
- `dock` (0.3s, no bounce): the sidebar ↔ chat ↔ workspace layout, one spring for all three.
- `morph` (0.34s, bounce 0.12): a control becoming its own surface (the effort pill). The only spring with give.
- Durations: feedback 100–150ms, state 160–260ms, panels and views ≤ 300ms. Nothing in product UI runs longer.

What animates, and why:

- **Feedback:** press dips, send ↔ stop swap, toggles, menus growing from their trigger, copy → check.
- **Continuity:** expand/collapse by height (`Collapse`), sliding selection backgrounds (tabs, chips, tree rows, sidebar rows, effort rows), text swapping in place (`SwapText`), the dock, chat switching as a crossfade of the conversation only (frame and composer stay still).
- **Focus pull:** while the chat column is squeezed or released (the side panel opening, the sidebar folding), the conversation goes soft, up to 5px of blur following how fast its width changes (peaking about 200ms in), and is back in focus about as the move lands, like a lens following a moving subject. Zero at rest, `none` under reduced motion; the header stays sharp.
- **Hierarchy:** a step's check landing when it completes, the worktree strip rising from behind the composer when a turn makes a plan and settling into its finished state, your new message leaving the composer (up 14px, from 0.97 scale, out of a 4px blur, growing from its bottom-right corner), the agent's reply rising 10px out of the same blur, "Ready for review" arriving when a task finishes while you watch.
- **Sequence of a send:** your message leaves the composer first; the reply's name follows 160ms later (`REPLY_DELAY`) and the thinking line 420ms after the send (`THINKING_DELAY`). Their space is already in the layout, so nothing moves when they appear. A block that joins a reply already being written (a tool call, a step) fades up 6px with no wait; prose blocks have no block entrance at all, their words are the entrance.
- **Streaming prose:** the words of the reply being written fade in from a 4px blur (`word-in`, 220ms, `--ease-out-quint`), each once, as they arrive. Only the last text block of a running reply does it; when the turn ends the words are plain text again, and a reply you open mid-stream does not replay what is already there. Reduced motion drops it.

What never animates: anything on the store's 1.4s simulation tick (entrances replay only for genuinely new items), streaming terminal lines, diff rows, the palette and slash-menu highlight (keyboard speed), elapsed timers and counters, and nothing ever loops except live state: the running spinner (1.6s), the shimmer on a running status line, the thinking line included (2.2s) and the held glyph pulse (1.8s).

**Following the conversation.** The view never steps. Whatever grows the conversation (your message, a reply being written, a tool block, the plan card) is followed by one gliding scroll (`followStep`, an exponential ease toward the bottom, ~110ms time constant), as long as you are near the bottom; scrolling up releases it, scrolling back to the bottom resumes it. Reduced motion snaps. The thinking line keeps its slot under the last reply when it goes (it fades, it does not collapse), so the reply does not drop when the turn ends; the slot folds away only when a newer message takes its place. If the view was pulled up because content got shorter, that is not scrolling away and does not release the follow. Scrolled well away (240px), a round "Jump to latest" button rises above the composer and glides you back.

**Room is made on one spring.** Whatever joins or leaves a conversation (a message, a tool block, the checkpoint or hold card, the outcome line, the thinking slot) animates its height and its gap together on `dock`, with its content fading; it never snaps. The follower sees one smooth change in height instead of a step in each direction (measured: sending used to move the older reply 70px up and 74px back, now 14px). Anything new that grows or shrinks the transcript uses `fold` in `MessageItem/rise.ts`. The checkpoint and hold cards belong to the latest reply only; earlier replies drop them.

**Copying.** A reply, your own message and each code block carry a quiet copy button that appears on hover or focus (copy → check, `useCopy`); the control reserves its place, so nothing moves when it appears. Streaming prose wraps plainly (no `text-wrap: pretty`): re-balancing the last lines made written words hop to the next line.

**Entrances inside a conversation** rely on `FreshPresence`: the chat column sits under an `AnimatePresence initial={false}` (for the chat-switch crossfade), which blocks the entrance of every motion component below it unless the transcript resets its presence.

**Reduced motion:** `MotionConfig reducedMotion="user"` drops transform and layout animation; the dock widths snap; CSS loops stop (a still spinner still reads as working); colour and opacity changes stay so state remains legible.

**The Motion Reports State Rule.** Nothing moves for decoration. A loop means an agent is working or waiting; an entrance means something just arrived; a slide means the same thing moved.

### Copy voice

UI copy says what it is, in sentence case: "Needs your decision", "Ready for review", "Starts next", "Reasoning". Product language over metaphor; no jokes about failure, money or blocked work; no invented claims, customers or numbers (demo data stays recognisably synthetic).

## Do's and Don'ts

### Do:

- **Do** build every surface from the graphite ladder: Ground for the sidebar and rail, Panel for the page, Raised for cards and composers, Overlay for floating layers, Inset for wells and composer strips.
- **Do** make the one decisive action per region an ink Button or an ink round button; everything else is secondary, ghost or a pill.
- **Do** reach for `components/ui` and `styles.ts` (`surface.*`, `pressable`, `segment`) before writing a surface or a pressable again.
- **Do** put task context (worktree, branch, PR, subagents) in the composer tray or the worktree strip, tucked behind the composer, never floating above it.
- **Do** keep status cards near the composer collapsed to one line by default and expandable on demand.
- **Do** keep the chat at its 700px reading width alone, and narrow it to the 40/60 split only while the workspace is open, on the shared `dock` spring.
- **Do** use the motion tokens; exits faster than entrances; animate only feedback, continuity or hierarchy.
- **Do** keep Libre Baskerville to its named seats and machine text in Geist Mono.
- **Do** give every icon-only control a `label`.
- **Do** keep one agent per task: one worktree strip, one workspace, one status line.

### Don't:

- **Don't** add equalisers, waveforms, glows, neon, colour blobs, gradient fills or "AI energy" effects; delight is continuity of shape and position.
- **Don't** skin the review as VS Code: borrow its anatomy (explorer, tabs, breadcrumbs, gutter, status bar, keys), never its blue status bar, its fonts or its colour theme. And don't nest cards inside the mini-IDE; its panes meet at hairlines.
- **Don't** use indigo or violet as an accent; violet is `merge` and means merged.
- **Don't** add a blue (or any coloured) primary button.
- **Don't** wrap things in cards by default, and never nest a card in a card.
- **Don't** use emoji as icons; icons are Lucide at one stroke weight.
- **Don't** float status pills or badges above the composer.
- **Don't** introduce themed metaphors, ironic copy or invented worlds; the product is a calm tool.
- **Don't** build dense dashboards, stat tiles, columns of agents or multi-agent arenas (best-of-N, side-by-side compare).
- **Don't** swap one word of a headline into serif, italic or colour for "taste".
- **Don't** give everything the same fade-and-rise entrance, stagger whole lists, add bounce outside `morph`, or animate on the simulation tick.
- **Don't** use syntax or diff colours for app state, or status colours inside code.
- **Don't** use colour for navigation, selection or emphasis; those are white alpha washes.
- **Don't** set reading text in Ink 4, use uppercase or letter-spaced labels, or draw vendor logos for agents.
