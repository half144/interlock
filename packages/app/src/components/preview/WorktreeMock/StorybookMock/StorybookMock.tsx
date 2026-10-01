import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { customerStyle } from "@/components/preview/WorktreeMock/customerStyle";
import { StoryStates } from "./StoryStates/StoryStates";

const stories = ["Button", "Combobox", "Input", "Select", "Toggle"];

const audit = [
  ["Focus ring uses --focus-ring", "14 of 14 components"],
  ["Focus indicator contrast", "3.4:1 against surface"],
  ["Focus not obscured", "Pass"],
];

/** The customer's Storybook, showing the focus-ring states this worktree changed. */
export function StorybookMock({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="min-h-[640px] bg-white" style={customerStyle}>
        <div className="border-b border-zinc-200 px-5 py-3.5 text-[14px] font-semibold text-zinc-900">
          Button · Focus
        </div>
        <StoryStates stacked />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[220px_1fr] bg-white" style={customerStyle}>
      <nav className="flex flex-col gap-1 border-r border-zinc-200 bg-zinc-50 p-4 text-[13px]">
        <span className="mb-3 flex h-8 items-center gap-2 rounded-md border border-zinc-200 bg-white px-2.5 text-zinc-400">
          <Search className="size-3.5" />
          Find components
        </span>
        <span className="mb-1 text-[11px] font-semibold tracking-[0.06em] text-zinc-400 uppercase">
          Components
        </span>
        {stories.map((s) => (
          <span
            key={s}
            className={cn(
              "rounded-md px-2.5 py-1.5",
              s === "Button"
                ? "bg-(--customer-brand)/10 font-medium text-(--customer-brand)"
                : "text-zinc-600",
            )}
          >
            {s}
          </span>
        ))}
      </nav>
      <div className="flex flex-col">
        <div className="flex h-11 items-center gap-5 border-b border-zinc-200 px-6 text-[13px]">
          <span className="font-semibold text-zinc-900">Canvas</span>
          <span className="text-zinc-500">Docs</span>
          <span className="ml-auto text-zinc-400">@lumen/ui-kit 4.9.0-next</span>
        </div>
        <StoryStates />
        <div className="border-t border-zinc-200">
          <div className="flex h-10 items-center gap-5 border-b border-zinc-200 px-6 text-[13px]">
            <span className="text-zinc-500">Controls</span>
            <span className="border-b-2 border-(--customer-brand) py-2.5 font-semibold text-zinc-900">
              Accessibility
            </span>
          </div>
          <ul className="flex flex-col px-6 py-3 text-[13px]">
            {audit.map(([rule, result]) => (
              <li
                key={rule}
                className="flex items-center gap-3 border-b border-zinc-100 py-2.5 last:border-0"
              >
                <Check className="size-4 text-emerald-600" />
                <span className="text-zinc-800">{rule}</span>
                <span className="ml-auto text-zinc-500">{result}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
