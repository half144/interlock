import { Popover } from "@/components/ui/Popover/Popover";
import { Pill } from "@/components/ui/Pill/Pill";
import { PillReading } from "./PillReading/PillReading";
import { ProviderUsageSection } from "./ProviderUsageSection/ProviderUsageSection";
import { useUsagePill } from "./useUsagePill";

/** Each provider's mark and what is left of its tightest window; opens to every window, balance and reset. */
export function UsagePill() {
  const { providers } = useUsagePill();

  return (
    <Popover
      align="end"
      className="w-[300px] rounded-xl p-0"
      trigger={({ open, toggle }) => (
        <Pill aria-expanded={open} title="Usage left" className="gap-3" onClick={toggle}>
          {providers.map((p) => (
            <PillReading key={p.kind} view={p} />
          ))}
        </Pill>
      )}
    >
      {() => (
        <div className="divide-y divide-seam">
          {providers.map((p) => (
            <ProviderUsageSection key={p.kind} view={p} />
          ))}
        </div>
      )}
    </Popover>
  );
}
