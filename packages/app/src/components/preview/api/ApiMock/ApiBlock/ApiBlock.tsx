import { CodeText } from "@/components/ui/CodeText/CodeText";

export function ApiBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="placard">{label}</span>
      <pre className="overflow-x-auto rounded-md border border-seam bg-panel px-3 py-2.5 font-mono text-xs leading-5 text-ink-2">
        {text.split("\n").map((line, i) => (
          <div key={i}>
            <CodeText text={line} />
          </div>
        ))}
      </pre>
    </div>
  );
}
