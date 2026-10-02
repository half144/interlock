import { X } from "lucide-react";
import { surface } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { useDaemonNotice } from "./useDaemonNotice";

/** One line at the top of the window while the daemon is not connected, or when an action failed. */
export function DaemonNotice() {
  const notice = useDaemonNotice();
  if (!notice) return null;

  return (
    <div
      role={notice.tone === "error" ? "alert" : "status"}
      className={cn(
        surface.overlay,
        "fixed top-14 left-1/2 z-50 flex max-w-[min(560px,90vw)] -translate-x-1/2 items-center gap-2 rounded-lg px-3.5 py-2 text-[13px]",
        notice.tone === "error" ? "text-red" : "text-ink-2",
      )}
    >
      <span className="[text-wrap:pretty]">{notice.text}</span>
      {notice.tone === "error" && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={notice.dismiss}
          className="rounded p-0.5 text-ink-3 hover:text-ink"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
