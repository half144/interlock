import { cn } from "@/lib/utils";

const tone = { info: "text-ink-3", warning: "text-hold", error: "text-red" };

export function NoticeLine({ level, text }: { level: "info" | "warning" | "error"; text: string }) {
  return <p className={cn("text-[13.5px]", tone[level])}>{text}</p>;
}
