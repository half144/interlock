import { useId } from "react";
import { Input } from "@/components/ui/Input/Input";
import { optionsOf } from "@/lib/options";
import { Picker } from "@/components/ui/Picker/Picker";
import { Tabs } from "@/components/ui/Tabs/Tabs";
import { fieldLabel } from "@/lib/styles";
import { describeCron } from "@/features/automations/utils/cron";
import {
  ALERT_SOURCES,
  DEFAULT_ISSUE_LABEL,
  type Draft,
  type TriggerType,
} from "@/features/automations/utils/draft";

const TRIGGERS: { value: TriggerType; label: string }[] = [
  { value: "schedule", label: "Schedule" },
  { value: "issue", label: "Issue label" },
  { value: "alert", label: "Alert" },
  { value: "pr", label: "PR" },
];

/** What starts the automation: the trigger type, then the one input that type needs. */
export function TriggerField({
  draft: d,
  set,
}: {
  draft: Draft;
  set: (patch: Partial<Draft>) => void;
}) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={labelId} className="col-span-2 flex flex-col gap-2">
      <span id={labelId} className={fieldLabel}>
        Trigger
      </span>
      <div className="flex items-center gap-3">
        <Tabs<TriggerType>
          value={d.type}
          onChange={(type) => set({ type })}
          items={TRIGGERS}
          className="h-9 rounded-lg p-1"
        />
        {d.type === "schedule" && (
          <>
            <Input
              mono
              aria-label="Cron expression"
              className="w-40"
              value={d.cron}
              onChange={(e) => set({ cron: e.target.value })}
            />
            <span className="text-[12.5px] text-ink-2">{describeCron(d.cron)}</span>
          </>
        )}
        {(d.type === "issue" || d.type === "pr") && (
          <Input
            aria-label={d.type === "issue" ? "Issue label" : "Path filter"}
            className="w-72"
            value={d.label}
            onChange={(e) => set({ label: e.target.value })}
            placeholder={d.type === "issue" ? DEFAULT_ISSUE_LABEL : "PR touches migrations/**"}
          />
        )}
        {d.type === "alert" && (
          <div className="w-44">
            <Picker
              label="Alert source"
              value={d.source}
              options={optionsOf(ALERT_SOURCES)}
              onChange={(source) => set({ source })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
