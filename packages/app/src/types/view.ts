export type View =
  | { kind: "yard" }
  | { kind: "thread"; threadId: string }
  | { kind: "automations" }
  | { kind: "settings"; projectId: string };

export type PanelTab = "diff" | "terminal" | "preview" | "checks" | "agents";
