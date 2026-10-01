/** Agent prose: paragraphs on blank lines, `backticks` become inline code. */
export function Prose({ text }: { text: string }) {
  return (
    <div className="prose-agent text-[15px] leading-[1.65] text-ink [text-wrap:pretty]">
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i}>
          {para
            .split(/(`[^`]+`)/)
            .map((part, j) =>
              part.startsWith("`") && part.endsWith("`") ? (
                <code key={j}>{part.slice(1, -1)}</code>
              ) : (
                part
              ),
            )}
        </p>
      ))}
    </div>
  );
}
