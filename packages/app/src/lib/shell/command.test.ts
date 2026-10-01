import { describe, expect, it } from "vitest";
import { describeCommand } from "./command";

const said = (command: string) => {
  const s = describeCommand(command);
  return s.target ? `${s.verb} ${s.target}` : s.verb;
};

describe("describeCommand", () => {
  it("names a look around in one line", () => {
    expect(said("ls && head -60 README.md && cat package.json | head -45")).toBe(
      "Listed files and read README.md, package.json",
    );
    expect(
      said(
        "ls -a && echo --- && git log --oneline -5 && echo --- && find . -path ./.git -prune -o -type f -print | head -50",
      ),
    ).toBe("Listed files and read the git log");
    expect(said("cat package.json | head -20 && git status")).toBe(
      "Read package.json and checked git status",
    );
  });

  it("marks exploration and keeps the files it read", () => {
    const summary = describeCommand('sed -n 60,121p README.md && echo "===" && cat package.json');
    expect(summary).toMatchObject({
      kind: "read",
      explored: { files: ["README.md", "package.json"], looks: [] },
    });
  });

  it("unrolls a for loop over files", () => {
    const summary = describeCommand(
      'for f in README.md package.json docs/overview.md src/count.ts src/index.ts; do echo "=== $f"; cat "$f"; done',
    );
    expect(summary.target).toBe("README.md, package.json and 3 more");
    expect(summary.explored?.files).toHaveLength(5);
  });

  it("names searches with their query and place", () => {
    expect(said('grep -rn "count" src')).toBe("Searched for “count” in src");
    expect(said("rg -n Stats src")).toBe("Searched for “Stats” in src");
    expect(said("rg -e TODO -g '*.ts' .")).toBe("Searched for “TODO”");
    expect(describeCommand("find . -name '*.md' -not -path './.git/*'")).toMatchObject({
      verb: "Found files matching",
      target: "*.md",
      literal: true,
    });
  });

  it("knows tests, scripts and installs", () => {
    expect(said("npm test 2>&1 | tail -30")).toBe("Ran tests");
    expect(said("cd /repo && pnpm run test:unit")).toBe("Ran tests");
    expect(said("npx vitest run src/count.test.ts")).toBe("Ran tests in count.test.ts");
    expect(said("node --experimental-strip-types --test src/a.test.ts")).toBe(
      "Ran tests in a.test.ts",
    );
    expect(said("npm run lint")).toBe("Ran the linter");
    expect(said("pnpm install")).toBe("Installed dependencies");
    expect(said("npm i zod")).toBe("Installed zod");
  });

  it("names git work", () => {
    expect(said("git diff --stat")).toBe("Looked at the diff");
    expect(said("git -C /repo status --short")).toBe("Checked git status");
    expect(said('git commit -m "Add tests"')).toBe("Committed “Add tests”");
    expect(said("git checkout -b feat/tests")).toBe("Created branch feat/tests");
    expect(describeCommand("git status").explored).toEqual({ files: [], looks: ["git"] });
    expect(describeCommand("git push").explored).toBeUndefined();
  });

  it("names a file written through a redirect", () => {
    expect(said("echo red > colors.txt")).toBe("Wrote colors.txt");
    expect(said("echo green >> colors.txt && cat colors.txt")).toBe(
      "Added to colors.txt and read colors.txt",
    );
  });

  it("joins a change with what came with it", () => {
    const summary = describeCommand("sed -i '' 's|a|b|' package.json && npm test 2>&1 | tail -15");
    expect(summary).toMatchObject({ kind: "edit", verb: "Edited package.json and ran tests" });
    expect(summary.explored).toBeUndefined();
  });

  it("says Ran with the part it doesn't know, as typed", () => {
    expect(describeCommand('node scripts/missing.js; echo "exit=$?"')).toMatchObject({
      kind: "run",
      verb: "Ran",
      target: "node scripts/missing.js",
      literal: true,
    });
    expect(said("cd /repo && make build && echo done")).toBe("Ran make build");
    expect(said("node gen.js > out.txt")).toBe("Ran node gen.js > out.txt");
    expect(said("find . -name '*.log' -delete")).toBe("Ran find . -name '*.log' -delete");
    expect(said("echo hi")).toBe("Ran echo hi");
  });

  it("sees through wrappers like sudo, env and rtk", () => {
    expect(said("rtk proxy find . -name '*.md'")).toBe("Found files matching *.md");
    expect(said("NODE_ENV=test npx -y vitest")).toBe("Ran tests");
    expect(said("rtk git status")).toBe("Checked git status");
  });

  it("falls back to the raw line for shell it won't read", () => {
    expect(said("echo $(git rev-parse HEAD)")).toBe("Ran echo $(git rev-parse HEAD)");
    expect(said("cat <<'EOF' > notes.md\nhello\nEOF")).toBe("Ran cat <<'EOF' > notes.md");
  });

  it("cuts long commands short", () => {
    const summary = describeCommand(`python ${"x".repeat(120)}.py`);
    expect(summary.target?.length).toBe(48);
    expect(summary.target?.endsWith("…")).toBe(true);
  });

  it("keeps every way a joined look-around looked", () => {
    expect(describeCommand("grep -rn count src && ls docs && git log --oneline -3")).toMatchObject({
      kind: "explore",
      explored: { files: [], looks: ["search", "list", "git"] },
    });
  });

  it("explores many files without a long sentence", () => {
    expect(
      said(
        "cat a.ts b.ts c.ts d.ts && rg -n useStore src/features/thread && ls src/components && git log -3",
      ),
    ).toBe("Explored a.ts, b.ts and 2 more");
  });
});
