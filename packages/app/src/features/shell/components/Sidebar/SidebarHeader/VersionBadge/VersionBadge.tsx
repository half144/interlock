import { appVersion } from "@/lib/appVersion";

export function VersionBadge() {
  return (
    <span
      title={appVersion.title}
      className="inline-flex h-[18px] items-center rounded-full border border-seam px-1.5 font-mono text-[10.5px] leading-none text-ink-4"
    >
      {appVersion.text}
    </span>
  );
}
