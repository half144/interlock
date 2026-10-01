import { Popover } from "@/components/ui/Popover/Popover";
import { Pill } from "@/components/ui/Pill/Pill";
import { ProviderUsageSection } from "./ProviderUsageSection/ProviderUsageSection";
import { UsageRing } from "./UsageRing/UsageRing";
import { useUsagePill } from "./useUsagePill";

/** What is left of each provider's 5h window as two rings; opens to every window and when it resets. */
export function UsagePill() {
  const { providers } = useUsagePill();

  return (
    <Popover
      align="end"
      className="w-[320px] p-4"
      trigger={({ open, toggle }) => (
        <Pill aria-expanded={open} aria-label="Usage left" title="Usage left" onClick={toggle}>
          {providers.map((p) => (
            <UsageRing key={p.kind} state={p.ring} />
          ))}
        </Pill>
      )}
    >
      {() => (
        <div className="flex flex-col gap-5">
          {providers.map((p) => (
            <ProviderUsageSection key={p.kind} view={p} />
          ))}
        </div>
      )}
    </Popover>
  );
}
