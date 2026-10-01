import { ChevronDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { customerStyle } from "@/components/preview/WorktreeMock/customerStyle";
import { AddressAutocomplete } from "./AddressAutocomplete/AddressAutocomplete";
import { CheckoutField } from "./CheckoutField/CheckoutField";
import { OrderSummary } from "./OrderSummary/OrderSummary";

/** The customer's checkout, as the agent's worktree would render it. Its palette is theirs, not Interlock's. */
export function CheckoutMock({ compact = false }: { compact?: boolean }) {
  return (
    <div className="bg-white text-zinc-900" style={customerStyle}>
      <header
        className={cn(
          "flex items-center border-b border-zinc-200",
          compact ? "h-14 px-5" : "h-16 px-10",
        )}
      >
        <span className="text-[20px] font-bold tracking-[-0.03em] text-zinc-900">lumen</span>
        {!compact && (
          <ol className="ml-12 flex items-center gap-6 text-[13px]">
            <li className="text-zinc-500">Cart</li>
            <li className="font-semibold text-zinc-900">Shipping</li>
            <li className="text-zinc-400">Payment</li>
          </ol>
        )}
        <span className="ml-auto flex items-center gap-1.5 text-[12px] text-zinc-500">
          <Lock className="size-3.5" />
          Secure checkout
        </span>
      </header>

      {compact && (
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 py-3.5 text-[14px]">
          <span className="flex items-center gap-1.5 text-(--customer-brand)">
            Show order summary <ChevronDown className="size-4" />
          </span>
          <span className="font-semibold tabular-nums">$184.00</span>
        </div>
      )}

      <div className={cn(compact ? "px-5 py-6" : "grid grid-cols-[1fr_380px] gap-12 px-10 py-10")}>
        <section className="flex flex-col gap-5">
          <h2
            className={cn(
              "font-semibold tracking-[-0.02em]",
              compact ? "text-[20px]" : "text-[24px]",
            )}
          >
            Shipping address
          </h2>
          <CheckoutField label="Full name" value="Ada Moreira" />
          <AddressAutocomplete />
          <div className={cn("grid gap-4", compact ? "grid-cols-1" : "grid-cols-2")}>
            <CheckoutField label="Apartment, suite" value="Apt 4B" />
            <CheckoutField label="Phone" value="(718) 555-0134" />
          </div>
          <span className="mt-2 flex h-12 items-center justify-center rounded-lg bg-(--customer-brand) text-[15px] font-semibold text-white">
            Continue to payment
          </span>
        </section>
        {!compact && <OrderSummary />}
      </div>
    </div>
  );
}
