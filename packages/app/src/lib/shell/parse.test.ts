import { describe, expect, it } from "vitest";
import { parseShell } from "./parse";

const argvs = (source: string) => parseShell(source)?.map((p) => p.map((c) => c.argv));

describe("parseShell", () => {
  it("splits on operators and pipes, honouring quotes", () => {
    expect(argvs(`ls -a && grep -rn "a && b" src | head -5; echo 'x|y'`)).toEqual([
      [["ls", "-a"]],
      [
        ["grep", "-rn", "a && b", "src"],
        ["head", "-5"],
      ],
      [["echo", "x|y"]],
    ]);
  });

  it("drops redirections and notes the files they write", () => {
    const parsed = parseShell("cat a 2>/dev/null >&2; cat b > c.txt 2>>err.log; echo 2 > d");
    const [quiet, loud, two] = parsed?.map((pipeline) => pipeline[0]) ?? [];
    expect(quiet).toMatchObject({ argv: ["cat", "a"], outputs: [] });
    expect(loud).toMatchObject({
      argv: ["cat", "b"],
      outputs: [
        { path: "c.txt", append: false, fd: 1 },
        { path: "err.log", append: true, fd: 2 },
      ],
    });
    expect(two).toMatchObject({ argv: ["echo", "2"], outputs: [{ path: "d", fd: 1 }] });
  });

  it("keeps each command's raw text", () => {
    expect(parseShell("cd /x && npm test 2>&1 | tail -3")?.[1]?.[0]?.raw).toBe("npm test 2>&1");
  });

  it("refuses what it can't read safely", () => {
    expect(parseShell("echo $(date)")).toBeNull();
    expect(parseShell("(cd x && ls)")).toBeNull();
    expect(parseShell("cat <<EOF\nx\nEOF")).toBeNull();
    expect(parseShell("echo 'open")).toBeNull();
  });
});
