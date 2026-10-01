import { ShoppingBag } from "lucide-react";

const items = [
  ["Merino crew, charcoal", "M · Qty 1", "$98.00"],
  ["Canvas tote, natural", "Qty 2", "$64.00"],
];

const totals = [
  ["Subtotal", "$162.00"],
  ["Shipping", "$8.00"],
  ["Tax", "$14.00"],
];

export function OrderSummary() {
  return (
    <aside className="flex flex-col gap-4 rounded-xl bg-zinc-50 p-6">
      <h3 className="text-[15px] font-semibold text-zinc-900">Order summary</h3>
      {items.map(([name, meta, price]) => (
        <div key={name} className="flex items-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-lg border border-zinc-200 bg-white">
            <ShoppingBag className="size-5 text-zinc-400" />
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-[14px] text-zinc-900">{name}</span>
            <span className="text-[12px] text-zinc-500">{meta}</span>
          </span>
          <span className="text-[14px] text-zinc-900 tabular-nums">{price}</span>
        </div>
      ))}
      <dl className="flex flex-col gap-2 border-t border-zinc-200 pt-4 text-[14px]">
        {totals.map(([k, v]) => (
          <div key={k} className="flex justify-between text-zinc-600">
            <dt>{k}</dt>
            <dd className="tabular-nums">{v}</dd>
          </div>
        ))}
        <div className="flex justify-between pt-2 text-[16px] font-semibold text-zinc-900">
          <dt>Total</dt>
          <dd className="tabular-nums">$184.00</dd>
        </div>
      </dl>
    </aside>
  );
}
