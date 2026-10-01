const LAYOUT = [
  ["Padding", "16px 20px"],
  ["Gap", "12px"],
  ["Width", "Fill"],
  ["Height", "Hug"],
];

export function LayoutProperties() {
  return (
    <dl className="grid grid-cols-2 gap-2 px-3 py-3 text-[12.5px]">
      {LAYOUT.map(([k, v]) => (
        <div key={k}>
          <dt className="text-ink-3">{k}</dt>
          <dd className="mt-1 flex h-8 items-center rounded-lg bg-inset px-2 font-mono text-ink">
            {v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
