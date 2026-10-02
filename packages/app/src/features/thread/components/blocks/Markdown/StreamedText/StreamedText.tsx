import { useContext, useState } from "react";
import { keyed } from "@/features/thread/utils/blocks";
import { isSpace, splitWords } from "@/features/thread/utils/words";
import { StreamFade } from "./StreamFade";

/**
 * Text that fades in word by word while it streams. A word keeps its position in the text, so it mounts, and
 * animates, once. The words already there when the node first appeared (a reply you open mid-stream) stay still.
 */
export function StreamedText({ value }: { value: string }) {
  const fade = useContext(StreamFade);
  const words = splitWords(value);
  const [still] = useState(() => (fade ? 0 : words.length));
  if (!fade) return value;
  return keyed(words).map(({ item: word, key }) =>
    key < still || isSpace(word) ? (
      word
    ) : (
      <span key={key} className="animate-word-in">
        {word}
      </span>
    ),
  );
}
