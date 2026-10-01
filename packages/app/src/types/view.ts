export type View =
  | { kind: "yard" }
  | { kind: "thread"; threadId: string }
  | { kind: "automations" }
  | { kind: "settings"; projectId: string }
  | { kind: "accounts" };

export type PanelTab = "diff" | "terminal" | "checks" | "agents";
