import { Check, ChevronDown } from "lucide-react";
import type { ModelChoice } from "@/features/home/types";
import { agentLabel, kindLabel } from "@/lib/agentKinds";
import { AgentMark } from "@/components/ui/AgentMark/AgentMark";
import { MenuItem } from "@/components/ui/MenuItem/MenuItem";
import { Popover } from "@/components/ui/Popover/Popover";
import { useModelPicker } from "./useModelPicker";

export function ModelPicker({
  value,
  onChange,
}: {
  value: ModelChoice;
  onChange: (v: ModelChoice) => void;
}) {
  const { providers, labelOf } = useModelPicker();

  return (
    <Popover
      className="w-64"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[16px] font-medium text-ink hover:bg-hover"
        >
          {agentLabel(value)}
          <span className="font-normal text-ink-3">{labelOf(value)}</span>
          <ChevronDown className="size-4 text-ink-3" />
        </button>
      )}
    >
      {(close) =>
        providers.map(({ kind: k, models }) => (
          <div key={k} className="pb-1">
            <p className="px-2 pt-1.5 pb-1 text-[12px] text-ink-3">{kindLabel(k)}</p>
            {models.map((m) => (
              <MenuItem
                key={m.id}
                active={k === value.kind && m.id === value.model}
                onSelect={() => {
                  onChange({ kind: k, model: m.id });
                  close();
                }}
                hint={
                  k === value.kind && m.id === value.model ? (
                    <Check className="size-3.5" />
                  ) : undefined
                }
              >
                <AgentMark kind={k} className="size-4" />
                {m.label}
              </MenuItem>
            ))}
          </div>
        ))
      }
    </Popover>
  );
}
