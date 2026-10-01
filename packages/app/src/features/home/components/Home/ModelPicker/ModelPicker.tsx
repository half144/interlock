import { ChevronDown } from "lucide-react";
import type { ModelChoice } from "@/features/home/types";
import { agentLabel } from "@/lib/agentKinds";
import { MorphSurface } from "@/components/ui/MorphSurface/MorphSurface";
import { ModelMenu } from "./ModelMenu/ModelMenu";
import { useModelPicker } from "./useModelPicker";

export function ModelPicker({
  value,
  onChange,
}: {
  value: ModelChoice;
  onChange: (v: ModelChoice) => void;
}) {
  const { providers, open, maxHeight, root, trigger, labelOf, show, close } = useModelPicker();

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={show}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[16px] font-medium text-ink hover:bg-hover"
      >
        {agentLabel(value)}
        <span className="font-normal text-ink-3">{labelOf(value)}</span>
        <ChevronDown className="size-4 text-ink-3" />
      </button>
      <MorphSurface open={open} side="bottom" align="start" className="w-[272px]">
        <ModelMenu
          providers={providers}
          value={value}
          maxHeight={maxHeight}
          onPick={(choice) => {
            onChange(choice);
            close();
          }}
          onClose={close}
        />
      </MorphSurface>
    </div>
  );
}
