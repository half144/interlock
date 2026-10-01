import { FlowPreview } from "./FlowPreview/FlowPreview";

const CAPABILITIES = [
  "Isolated worktrees",
  "Plan first",
  "Subagents",
  "Diff review",
  "Terminal",
  "Pull requests",
  "CI checks",
  "Attachments",
];

/** What a task goes through in Interlock, as Manus closes its home with what it can do. */
export function TaskFlowCard() {
  return (
    <section className="mt-12 flex min-h-[156px] overflow-hidden rounded-2xl border border-seam bg-inset">
      <div className="min-w-0 flex-1 p-5">
        <h2 className="text-[14px] font-medium text-ink">From task to pull request</h2>
        <p className="mt-1 text-[13px] text-ink-3 [text-wrap:pretty]">
          Each agent works in its own worktree; you review the diff and ship it.
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {CAPABILITIES.map((capability) => (
            <li
              key={capability}
              className="rounded-full bg-hover px-2.5 py-1 text-[12px] text-ink-2"
            >
              {capability}
            </li>
          ))}
        </ul>
      </div>
      <FlowPreview />
    </section>
  );
}
