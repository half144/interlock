import { describe, expect, it } from "vitest";
import { isSafeHref, parseInline, parseMarkdown } from "./markdown";

const t = (value: string) => ({ type: "text", value });

describe("blocks", () => {
  it("parses headings and paragraphs", () => {
    expect(parseMarkdown("## Title\n\nHello\nworld")).toEqual([
      { type: "heading", depth: 2, children: [t("Title")] },
      { type: "paragraph", children: [t("Hello\nworld")] },
    ]);
  });

  it("parses lists with nesting, start number and tasks", () => {
    const list = parseMarkdown("- a\n  - b\n  - c\n- d")[0]!;
    expect(list).toMatchObject({ type: "list", ordered: false });
    if (list.type !== "list") throw new Error();
    expect(list.items).toHaveLength(2);
    expect(list.items[0]!.blocks[1]).toMatchObject({
      type: "list",
      items: [{}, {}],
    });

    const ol = parseMarkdown("3. x\n4. y")[0];
    expect(ol).toMatchObject({ ordered: true, start: 3 });

    const tasks = parseMarkdown("- [ ] a\n- [x] b\n- c")[0]!;
    if (tasks.type !== "list") throw new Error();
    expect(tasks.items.map((i) => i.checked)).toEqual([false, true, null]);
  });

  it("parses fenced code, closed and unterminated", () => {
    expect(parseMarkdown("```ts\nconst a = 1;\n```\nafter")).toEqual([
      { type: "code", lang: "ts", value: "const a = 1;" },
      { type: "paragraph", children: [t("after")] },
    ]);
    expect(parseMarkdown("~~~\nopen\nstill")).toEqual([
      { type: "code", lang: "", value: "open\nstill" },
    ]);
    expect(parseMarkdown("```")).toEqual([{ type: "code", lang: "", value: "" }]);
  });

  it("parses blockquote, hr and tables", () => {
    expect(parseMarkdown("> quoted\n> more")).toEqual([
      {
        type: "quote",
        blocks: [{ type: "paragraph", children: [t("quoted\nmore")] }],
      },
    ]);
    expect(parseMarkdown("---")).toEqual([{ type: "hr" }]);
    expect(parseMarkdown("| a | b |\n| - | - |\n| 1 | 2 |")).toEqual([
      {
        type: "table",
        head: [[t("a")], [t("b")]],
        rows: [[[t("1")], [t("2")]]],
      },
    ]);
  });
});

describe("inline", () => {
  it("parses code, bold, italic, strike", () => {
    expect(parseInline("`x` **b** *i* _j_ ~~s~~")).toEqual([
      { type: "code", value: "x" },
      t(" "),
      { type: "strong", children: [t("b")] },
      t(" "),
      { type: "em", children: [t("i")] },
      t(" "),
      { type: "em", children: [t("j")] },
      t(" "),
      { type: "del", children: [t("s")] },
    ]);
  });

  it("parses links and autolinks bare urls", () => {
    expect(parseInline("[a](https://x.io)")).toEqual([
      { type: "link", href: "https://x.io", children: [t("a")] },
    ]);
    expect(parseInline("see https://x.io/a.")).toEqual([
      t("see "),
      { type: "link", href: "https://x.io/a", children: [t("https://x.io/a")] },
      t("."),
    ]);
  });

  it("keeps snake_case literal", () => {
    expect(parseInline("my_var_name")).toEqual([t("my_var_name")]);
  });

  it("renders unclosed delimiters literally while streaming", () => {
    expect(parseInline("a **bold")).toEqual([t("a **bold")]);
    expect(parseInline("a `code")).toEqual([t("a `code")]);
    expect(parseInline("[lab](http://x")).toEqual([t("[lab](http://x")]);
    expect(parseInline("*")).toEqual([t("*")]);
    expect(parseMarkdown("text\n```py\nx = [")).toHaveLength(2);
  });
});

describe("isSafeHref", () => {
  it("allows http, https and mailto only", () => {
    expect(isSafeHref("https://a.b")).toBe(true);
    expect(isSafeHref("mailto:a@b.c")).toBe(true);
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
  });
});
