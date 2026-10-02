import { CodeText } from "@/components/ui/CodeText/CodeText";
import { monoText } from "@/lib/styles";
import { keyed } from "@/features/thread/utils/blocks";
import { CopyButton } from "@/features/thread/components/blocks/CopyButton/CopyButton";

export function CodeBlock({ lang, value }: { lang: string; value: string }) {
  return (
    <div className="group/code relative rounded-lg bg-inset">
      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
        {lang && <span className="text-[11px] text-ink-4">{lang}</span>}
        <CopyButton
          text={value}
          label="Copy code"
          className="bg-inset opacity-0 transition-opacity duration-150 group-hover/code:opacity-100 focus-visible:opacity-100"
        />
      </div>
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
