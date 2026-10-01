import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { checkStructure } from "./check-structure.mjs";

const roots = [];
const run = (files) => {
  const root = mkdtempSync(join(tmpdir(), "structure-"));
  roots.push(root);
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), text);
  }
  return checkStructure(root).map((v) => v.message);
};
after(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })));

const view = "export function Card() { return <div />; }\n";
const C = "features/a/components";

test("a well-formed tree passes", () => {
  const messages = run({
    [`${C}/Card/Card.tsx`]: `import { useCard } from "./useCard";\nexport function Card() { useCard(); return <div />; }\n`,
    [`${C}/Card/useCard.ts`]: "export function useCard() { return 1; }\n",
    [`${C}/Card/Card.test.tsx`]: `import { Card } from "./Card";\nexport const t = Card;\n`,
    [`${C}/Card/Chip/Chip.tsx`]: "export function Chip() { return <i />; }\n",
    [`${C}/blocks/Step/Step.tsx`]: "export function Step() { return <b />; }\n",
  });
  assert.deepEqual(messages, []);
});

test("flags a loose component and names the fix", () => {
  const [message, ...rest] = run({ [`${C}/Card.tsx`]: view });
  assert.equal(rest.length, 0);
  assert.match(message, /components\/Card\.tsx.*Move it to Card\/Card\.tsx/);
});

test("flags a loose file in components/ui", () => {
  const messages = run({
    "components/ui/Button.tsx": "export function Button() { return <button />; }\n",
  });
  assert.match(messages.join("\n"), /components\/ui\/Button\.tsx/);
});

test("flags a component in a folder with another name and barrels", () => {
  const messages = run({
    [`${C}/Card/Panel.tsx`]: view,
    [`${C}/Card/index.ts`]: "export {};\n",
  });
  assert.equal(messages.length, 2);
  assert.match(messages.join("\n"), /Move it to Panel\/Panel\.tsx/);
  assert.match(messages.join("\n"), /barrel/);
});

test("a hook must sit in its component folder", () => {
  const messages = run({
    [`${C}/Card/Card.tsx`]: view,
    [`${C}/Card/useOther.ts`]: "export const useOther = () => 1;\n",
  });
  assert.match(messages.join("\n"), /useOther\.ts.*Other\//);
});

test("a paired hook is imported only by its component", () => {
  const messages = run({
    [`${C}/Card/Card.tsx`]: view,
    [`${C}/Card/useCard.ts`]: "export const useCard = () => 1;\n",
    [`${C}/Other/Other.tsx`]: `import { useCard } from "../Card/useCard";\nexport const Other = () => <i>{useCard()}</i>;\n`,
  });
  assert.equal(messages.length, 1);
  assert.match(messages[0], /Other\.tsx imports useCard\.ts.*Only Card\.tsx/);
});

test("a hook does not import its component", () => {
  const messages = run({
    [`${C}/Card/Card.tsx`]: view,
    [`${C}/Card/useCard.ts`]: `import { Card } from "./Card";\nexport const useCard = () => Card;\n`,
  });
  assert.match(messages.join("\n"), /imports its own component/);
});

test("utils and lib do not import react", () => {
  const messages = run({
    "lib/a.ts": `import { useState } from "react";\nexport const a = useState;\n`,
    "features/a/utils/b.ts": `export const b = () => import("react-dom/client");\n`,
    "lib/ok.ts": "export const ok = 1;\n",
  });
  assert.equal(messages.length, 2);
  assert.match(messages.join("\n"), /lib\/a\.ts imports "react"/);
});

test("flags dot components, including Object.assign", () => {
  const messages = run({
    [`${C}/Card/Card.tsx`]: `${view}Card.Header = () => <h1 />;\n`,
    [`${C}/Modal/Modal.tsx`]: `const Footer = () => <i />;\nexport const Modal = Object.assign(() => <b />, { Footer });\nconst Box = () => <i />;\nexport const Wrap = Object.assign(Box, { Footer });\n`,
  });
  assert.equal(messages.length, 2);
  assert.match(messages.join("\n"), /Card\.Header is a dot component/);
  assert.match(messages.join("\n"), /Wrap|Box\.Footer is a dot component/);
});

test("flags more than 3 boolean props", () => {
  const messages = run({
    [`${C}/Card/Card.tsx`]: `interface Props { a: boolean; b?: boolean; c: true | false; d?: boolean | undefined; e: string }\nexport function Card(props: Props) { return <i {...props} />; }\n`,
  });
  assert.equal(messages.length, 1);
  assert.match(messages[0], /4 boolean props \(a, b, c, d\).*variant/);
});

test("flags more than 10 props, through intersections and FC", () => {
  const keys = Array.from({ length: 11 }, (_, i) => `p${i}: string`).join("; ");
  const messages = run({
    [`${C}/Card/Card.tsx`]: `type A = { ${keys} };\nexport const Card: FC<A & { x: string }> = () => <i />;\n`,
  });
  assert.equal(messages.length, 1);
  assert.match(messages[0], /12 props, max 10.*slots/);
});

test("three booleans and ten props are fine", () => {
  const keys = Array.from({ length: 7 }, (_, i) => `p${i}: string`).join("; ");
  const messages = run({
    [`${C}/Card/Card.tsx`]: `export function Card(props: { a: boolean; b: boolean; c: boolean; ${keys} }) { return <i {...props} />; }\n`,
  });
  assert.deepEqual(messages, []);
});
