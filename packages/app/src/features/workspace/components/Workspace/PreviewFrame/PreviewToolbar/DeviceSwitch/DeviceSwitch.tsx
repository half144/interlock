import { useId } from "react";
import { motion } from "motion/react";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import type { Device } from "@/features/workspace/utils/preview";

const DEVICES = [
  ["desktop", Monitor, "Desktop"],
  ["mobile", Smartphone, "Mobile"],
] as const;

export function DeviceSwitch({
  device,
  onChange,
  mobileDisabled,
}: {
  device: Device;
  onChange: (device: Device) => void;
  mobileDisabled: boolean;
}) {
  const group = useId();
  return (
    <span
      className="flex items-center gap-0.5 rounded-lg bg-hover p-0.5"
      role="tablist"
      aria-label="Device"
    >
      {DEVICES.map(([value, Icon, label]) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={device === value}
          aria-label={label}
          disabled={mobileDisabled && value === "mobile"}
          onClick={() => onChange(value)}
          className={cn(
            "relative isolate inline-flex size-7 items-center justify-center rounded-md transition-colors disabled:opacity-40",
            device === value ? "text-ink" : "text-ink-3 hover:text-ink",
          )}
        >
          {device === value && (
            <motion.span
              layoutId={`${group}-device`}
              transition={spring}
              style={{ borderRadius: 6 }}
              className="absolute inset-0 -z-10 bg-raised shadow-button"
            />
          )}
          <Icon className="size-3.5" />
        </button>
      ))}
    </span>
  );
}
