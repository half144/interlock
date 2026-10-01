import { CodeText } from "@/components/ui/CodeText/CodeText";
import { monoText } from "@/lib/styles";
import { keyed } from "@/features/thread/utils/blocks";

export function CodeBlock({ lang, value }: { lang: string; value: string }) {
  return (
    <div className="relative rounded-lg bg-inset">
      {lang && <span className="absolute right-3 top-2 text-[11px] text-ink-4">{lang}</span>}
      <pre className={`${monoText} overflow-x-auto px-3.5 py-3 leading-[1.6] text-ink`}>
        <code className="!bg-transparent !p-0 !text-[length:inherit]">
          {keyed(value.split("\n")).map(({ item, key }) => (
            <div key={key} className="min-h-[1.6em] whitespace-pre">
              <CodeText text={item} />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
