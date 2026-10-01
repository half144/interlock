import {
  act,
  literal,
  nameList,
  operands,
  short,
  type CommandSummary,
  type Describe,
} from "./parts";

const ranTests = (args: string[] = []): CommandSummary => {
  const specs = operands(args).filter((arg) => /[./]/.test(arg));
  return specs.length > 0 ? act("test", "Ran tests in", nameList(specs)) : act("test", "Ran tests");
};

/** Scripts by their conventional names; anything else shows as typed. */
function script(name: string, raw: string): CommandSummary {
  if (name === "t" || name.startsWith("test")) return ranTests();
  if (name.startsWith("lint")) return act("run", "Ran the linter");
  if (/^(typecheck|type-check|check-types|tsc)/.test(name)) return act("run", "Checked types");
  if (name.startsWith("build")) return act("run", "Built the project");
  return literal(act("run", "Ran", short(raw)));
}

const MANAGER_VALUES = ["-w", "--workspace", "--prefix", "-C", "--dir", "-F", "--filter"];
const INSTALLS = new Set(["install", "i", "ci", "add"]);
const NPM_SCRIPTS = new Set(["test", "t", "start"]);

const manager =
  (program: string): Describe =>
  (args, raw) => {
    const [sub, ...rest] = operands(args, MANAGER_VALUES);
    if (sub === undefined)
      return program === "yarn" ? act("install", "Installed dependencies") : null;
    if (INSTALLS.has(sub)) {
      return rest.length > 0
        ? act("install", "Installed", short(rest.join(", "), 40))
        : act("install", "Installed dependencies");
    }
    if (sub === "run" || sub === "run-script") return rest[0] ? script(rest[0], raw) : null;
    if (program === "bun" && sub === "test") return ranTests(rest);
    if (program === "npm" && !NPM_SCRIPTS.has(sub)) return null;
    return script(sub, raw);
  };

const subcommandTest: Describe = (args) => (args[0] === "test" ? ranTests() : null);

const node: Describe = (args) => (args.includes("--test") ? ranTests(args) : null);

const python: Describe = (args) =>
  args[0] === "-m" && args[1] === "pytest" ? ranTests(args.slice(2)) : null;

const runner: Describe = (args) => ranTests(args.filter((arg) => arg !== "run" && arg !== "watch"));

export const SCRIPT_PROGRAMS: [string, Describe][] = [
  ["npm", manager("npm")],
  ["pnpm", manager("pnpm")],
  ["yarn", manager("yarn")],
  ["bun", manager("bun")],
  ["vitest", runner],
  ["jest", runner],
  ["mocha", runner],
  ["pytest", runner],
  ["playwright", subcommandTest],
  ["go", subcommandTest],
  ["cargo", subcommandTest],
  ["deno", subcommandTest],
  ["node", node],
  ["python", python],
  ["python3", python],
  ["tsc", () => act("run", "Checked types")],
  ["eslint", () => act("run", "Ran the linter")],
];
