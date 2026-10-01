import { MapPin, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

const suggestions = [
  { street: "221 Baltic Avenue", city: "Brooklyn, NY 11217" },
  { street: "221 Baltimore Street", city: "Philadelphia, PA 19103" },
  { street: "221 Balta Road", city: "Austin, TX 78745" },
  { street: "221 Baltusrol Way", city: "Short Hills, NJ 07078" },
];

/** The field this worktree rebuilt, caught mid-typing with its suggestions open. */
export function AddressAutocomplete() {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-zinc-700">Street address</span>
      <span className="flex h-11 items-center gap-2 rounded-lg border-2 border-(--customer-brand) bg-white px-3 text-[15px] text-zinc-900 ring-4 ring-(--customer-brand)/15">
        <MapPin className="size-4 text-zinc-400" />
        221 Balt
        <span className="-ml-1.5 h-5 w-px animate-lamp-hold bg-zinc-900" />
      </span>
      <div
        className="rounded-lg border border-zinc-200 bg-white py-1.5 shadow-[0_12px_28px_-10px_rgba(15,23,42,0.25)]"
        role="listbox"
      >
        {suggestions.map(({ street, city }, i) => (
          <div
            key={street}
            className={cn(
              "flex items-center gap-3 px-3.5 py-2",
              i === 1 && "bg-(--customer-brand)/[0.07]",
            )}
          >
            <MapPin
              className={cn(
                "size-4 shrink-0",
                i === 1 ? "text-(--customer-brand)" : "text-zinc-400",
              )}
            />
            <span className="flex flex-col">
              <span className="text-[14px] text-zinc-900">
                <b className="font-semibold">221 Balt</b>
                {street.slice(8)}
              </span>
              <span className="text-[12px] text-zinc-500">{city}</span>
            </span>
          </div>
        ))}
        <div className="mt-1 flex items-center gap-3 border-t border-zinc-100 px-3.5 pt-2.5 pb-1 text-[14px] font-medium text-(--customer-brand)">
          <PenLine className="size-4" />
          Enter address manually
        </div>
      </div>
    </div>
  );
}
