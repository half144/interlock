import { openExternal } from "@/platform/desktop";
import { Fragment, type ReactNode } from "react";
import { isSafeHref, type MdBlock, type MdInline } from "../../../utils/markdown";
import { keyed } from "@/features/thread/utils/blocks";
import { CodeBlock } from "./CodeBlock/CodeBlock";
import { StreamedText } from "./StreamedText/StreamedText";
import { StreamFade } from "./StreamedText/StreamFade";
import { useMarkdown } from "./useMarkdown";

/** AST nodes have no identity, so React keys them by position. */
const each = <T,>(items: T[], render: (item: T) => ReactNode) =>
  keyed(items).map(({ item, key }) => <Fragment key={key}>{render(item)}</Fragment>);

const HEADING_CLASS = [
  "",
  "text-[20px] leading-[1.3]",
  "text-[17px] leading-[1.35]",
  "text-[15.5px] leading-[1.4]",
  "text-[15px]",
  "text-[15px]",
  "text-[15px]",
];

function Inline({ nodes }: { nodes: MdInline[] }) {
  return each(nodes, (n): ReactNode => {
    switch (n.type) {
      case "text":
        return <StreamedText value={n.value} />;
      case "code":
        return <code>{n.value}</code>;
      case "strong":
        return (
          <strong className="font-semibold">
            <Inline nodes={n.children} />
          </strong>
        );
      case "em":
        return (
          <em>
            <Inline nodes={n.children} />
          </em>
        );
      case "del":
        return (
          <del className="text-ink-2">
            <Inline nodes={n.children} />
          </del>
        );
      case "link":
        return isSafeHref(n.href) ? (
          <a
            href={n.href}
            onClick={(e) => {
              e.preventDefault();
              void openExternal(n.href);
            }}
            className="text-ink underline decoration-ink-4 underline-offset-2 hover:decoration-ink"
          >
            <Inline nodes={n.children} />
          </a>
        ) : (
          <Inline nodes={n.children} />
        );
    }
  });
}

function Block({ block }: { block: MdBlock }) {
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.depth}` as "h1";
      return (
        <Tag className={`font-semibold ${HEADING_CLASS[block.depth]}`}>
          <Inline nodes={block.children} />
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p>
          <Inline nodes={block.children} />
        </p>
      );
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          start={block.ordered ? block.start : undefined}
          className={`space-y-1 pl-5 ${block.ordered ? "list-decimal" : "list-disc"} marker:text-ink-3`}
        >
          {each(block.items, (item) => (
            <li className={`space-y-1 ${item.checked === null ? "" : "list-none"}`}>
              {item.checked !== null && (
                <input
                  type="checkbox"
                  checked={item.checked}
                  readOnly
                  className="mr-2 -ml-5 align-middle"
                />
              )}
              <Blocks blocks={item.blocks} inline={item.checked !== null} />
            </li>
          ))}
        </Tag>
      );
    }
    case "code":
      return <CodeBlock lang={block.lang} value={block.value} />;
    case "quote":
      return (
        <blockquote className="border-l-2 border-seam pl-3.5 text-ink-2">
          <Blocks blocks={block.blocks} />
        </blockquote>
      );
    case "hr":
      return <hr className="border-seam" />;
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="border-collapse text-[13.5px]">
            <thead>
              <tr>
                {each(block.head, (cell) => (
                  <th className="border border-seam px-3 py-1.5 text-left font-semibold">
                    <Inline nodes={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {each(block.rows, (row) => (
                <tr>
                  {each(row, (cell) => (
                    <td className="border border-seam px-3 py-1.5 [&_code]:whitespace-nowrap">
                      <Inline nodes={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function Blocks({ blocks, inline = false }: { blocks: MdBlock[]; inline?: boolean }) {
  return each(blocks, (b) =>
    inline && b.type === "paragraph" && b === blocks[0] ? (
      <span>
        <Inline nodes={b.children} />
      </span>
    ) : (
      <Block block={b} />
    ),
  );
}

/** Agent prose as markdown. Built from the parsed AST, never from HTML strings. */
export function Markdown({ text, streaming = false }: { text: string; streaming?: boolean }) {
  const { blocks, fade } = useMarkdown(text, streaming);
  return (
    <StreamFade.Provider value={fade}>
      <div className="prose-agent space-y-3 text-[15px] leading-[1.65] break-words text-ink">
        <Blocks blocks={blocks} />
      </div>
    </StreamFade.Provider>
  );
}
