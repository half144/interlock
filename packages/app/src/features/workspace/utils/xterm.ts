import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { terminalTheme } from "./terminalTheme";

const SCROLLBACK_LINES = 5000;
const FONT_SIZE = 12;

interface TerminalSize {
  rows: number;
  cols: number;
}

interface XtermOptions {
  /** Output only: no cursor, and keystrokes go nowhere. */
  readOnly?: boolean;
  onData?: (data: string) => void;
  onResize?: (size: TerminalSize) => void;
}

export interface XtermHandle {
  write: (data: string | Uint8Array) => void;
  reset: () => void;
  focus: () => void;
  size: () => TerminalSize;
  dispose: () => void;
}

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** xterm.js in `host`, kept fitted to it. The daemon speaks bytes, so `write` takes them as they come. */
export function mountXterm(host: HTMLElement, options: XtermOptions): XtermHandle {
  const terminal = new Terminal({
    scrollback: SCROLLBACK_LINES,
    fontSize: FONT_SIZE,
    fontFamily: token("--font-mono"),
    theme: terminalTheme(token),
    cursorBlink: !options.readOnly,
    disableStdin: options.readOnly ?? false,
    allowProposedApi: true,
  });
  const fit = new FitAddon();
  terminal.loadAddon(fit);
  terminal.open(host);
  if (options.readOnly) terminal.write("\x1b[?25l");
  fit.fit();

  const input = terminal.onData((data) => options.onData?.(data));
  const resize = terminal.onResize(({ rows, cols }) => options.onResize?.({ rows, cols }));
  const observer = new ResizeObserver(() => fit.fit());
  observer.observe(host);
  void document.fonts.ready.then(() => fit.fit());

  return {
    write: (data) => terminal.write(data),
    reset: () => terminal.reset(),
    focus: () => terminal.focus(),
    size: () => ({ rows: terminal.rows, cols: terminal.cols }),
    dispose: () => {
      observer.disconnect();
      input.dispose();
      resize.dispose();
      terminal.dispose();
    },
  };
}
