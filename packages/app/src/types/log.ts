export type LogKind = "cmd" | "out" | "ok" | "err" | "dim";

export interface LogLine {
  kind: LogKind;
  text: string;
}
