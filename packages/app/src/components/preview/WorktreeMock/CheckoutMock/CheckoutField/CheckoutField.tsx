export function CheckoutField({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-zinc-700">{label}</span>
      <span className="flex h-11 items-center rounded-lg border border-zinc-300 bg-white px-3.5 text-[15px] text-zinc-900">
        {value}
      </span>
    </label>
  );
}
