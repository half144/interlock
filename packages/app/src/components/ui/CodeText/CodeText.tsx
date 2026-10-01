import { highlight, tokenClass } from "@/lib/highlight";

/** One highlighted line of code. Colour here is syntax, never state. */
export function CodeText({ text }: { text: string }) {
  return (
    <>
      {highlight(text).map((t, i) =>
        t.kind === "plain" ? (
          t.text
        ) : (
          <span key={i} className={tokenClass[t.kind]}>
            {t.text}
          </span>
        ),
      )}
    </>
  );
}
