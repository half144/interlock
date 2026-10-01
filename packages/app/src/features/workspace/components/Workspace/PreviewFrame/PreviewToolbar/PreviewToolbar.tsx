import { motion } from "motion/react";
import { ExternalLink, House, Maximize2, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/motion";
import { Button } from "@/components/ui/Button/Button";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { monoText } from "@/lib/styles";
import type { Device } from "@/features/workspace/utils/preview";
import { DeviceSwitch } from "./DeviceSwitch/DeviceSwitch";

interface PreviewToolbarProps {
  path: string;
  device: Device;
  onDevice: (device: Device) => void;
  isApi: boolean;
  editing: boolean;
  onToggleEdit: () => void;
  reloads: number;
  onReload: () => void;
}

/** A browser's chrome around the preview: device, address, reload, and the switch into visual editing. */
export function PreviewToolbar({
  path,
  device,
  onDevice,
  isApi,
  editing,
  onToggleEdit,
  reloads,
  onReload,
}: PreviewToolbarProps) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-1.5 border-b border-seam px-2">
      <DeviceSwitch device={device} onChange={onDevice} mobileDisabled={isApi} />

      <div className="mx-auto flex h-8 min-w-0 flex-1 items-center justify-center gap-1 px-2 text-ink-3">
        <House className="size-3.5 shrink-0" />
        <span className={cn(monoText, "truncate text-ink-2")}>{path}</span>
        <IconButton label="Open in a new tab" className="size-6 [&_svg]:size-3.5">
          <ExternalLink />
        </IconButton>
        <IconButton label="Reload" className="size-6 [&_svg]:size-3.5" onClick={onReload}>
          <motion.span
            animate={{ rotate: reloads * 360 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="inline-flex"
          >
            <RotateCw />
          </motion.span>
        </IconButton>
      </div>

      {!isApi && (
        <Button size="sm" variant={editing ? "primary" : "secondary"} onClick={onToggleEdit}>
          {editing ? "Exit edit" : "Edit"}
        </Button>
      )}
      <IconButton label="Full screen">
        <Maximize2 />
      </IconButton>
    </div>
  );
}
