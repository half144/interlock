import { cn } from "@/lib/utils";

const brand = "bg-(--customer-brand) text-white";
const ring = "outline-2 outline-offset-2 outline-(--customer-brand) outline";

/** The focus states this worktree changed, as the customer's Storybook canvas shows them. */
export function StoryStates({ stacked }: { stacked?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-8", stacked ? "p-5" : "p-10")}>
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-semibold tracking-[0.06em] text-zinc-500 uppercase">
          Button
        </span>
        <div className={cn("flex gap-4", stacked ? "flex-col items-start" : "items-center")}>
          <span className={cn("rounded-lg px-4 py-2.5 text-[14px] font-semibold", brand)}>
            Default
          </span>
          <span className={cn("rounded-lg px-4 py-2.5 text-[14px] font-semibold", brand, ring)}>
            Focus visible
          </span>
          <span className="rounded-lg border border-zinc-300 px-4 py-2.5 text-[14px] font-semibold text-zinc-800">
            Secondary
          </span>
          <span
            className={cn(
              "rounded-lg border border-zinc-300 px-4 py-2.5 text-[14px] font-semibold text-zinc-800",
              ring,
            )}
          >
            Secondary focus
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-semibold tracking-[0.06em] text-zinc-500 uppercase">
          Input
        </span>
        <div className={cn("flex gap-4", stacked && "flex-col")}>
          <span className="flex h-10 w-56 items-center rounded-lg border border-zinc-300 px-3 text-[14px] text-zinc-400">
            Email address
          </span>
          <span
            className={cn(
              "flex h-10 w-56 items-center rounded-lg border border-zinc-300 px-3 text-[14px] text-zinc-900",
              ring,
            )}
          >
            ada@lumen.shop
          </span>
        </div>
      </div>
    </div>
  );
}
