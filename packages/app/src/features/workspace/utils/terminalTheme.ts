import type { ITheme } from "@xterm/xterm";

const SELECTION = "rgb(106 164 255 / 0.3)";

/** The terminal's palette from the app's design tokens, so the shell reads as part of the page. */
export function terminalTheme(token: (name: string) => string): ITheme {
  return {
    background: token("--color-inset"),
    foreground: token("--color-ink-2"),
    cursor: token("--color-ink"),
    cursorAccent: token("--color-inset"),
    selectionBackground: SELECTION,
    black: token("--color-ground"),
    red: token("--color-red"),
    green: token("--color-green"),
    yellow: token("--color-hold"),
    blue: token("--color-run"),
    magenta: token("--color-merge"),
    cyan: token("--color-syn-string"),
    white: token("--color-ink-2"),
    brightBlack: token("--color-ink-4"),
    brightRed: token("--color-red"),
    brightGreen: token("--color-green"),
    brightYellow: token("--color-hold"),
    brightBlue: token("--color-run"),
    brightMagenta: token("--color-merge"),
    brightCyan: token("--color-syn-string"),
    brightWhite: token("--color-ink"),
  };
}
