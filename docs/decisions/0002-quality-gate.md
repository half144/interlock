# 0002 — Quality gate and baseline for inherited code

- **Context:** the fork brings thousands of lines written to Paseo's looser standard, and the new UI must follow the strict rules from day one. The gate has to be strict for new code without blocking on old code, and it has to be compatible with quality-kit (flat ESLint config, typescript-eslint type-aware, `eslint-suppressions.json` as the frozen debt).
- **Decision:**
  - `eslint.config.js` (flat): typescript-eslint `strictTypeChecked` + `stylisticTypeChecked` with `projectService`, react, react-hooks, jsx-a11y, import (`no-cycle`), eslint-comments (a disable needs a description), size and complexity limits. Project rules: views (`features/**/components/**/*.tsx`) cannot import the store, the daemon client or `useEffect`/`useLayoutEffect`/`useReducer`; `utils/` and `lib/` cannot import React.
  - `scripts/quality/check-structure.mjs` covers what lint cannot see: folder-per-component, hook pairing, dot components, prop counts. Run by `npm run structure`.
  - `tsconfig.base.json` is the strictest TypeScript; `tsconfig.legacy.json` is Paseo's looser one for the forked packages. New code never uses the legacy one.
  - **Baseline:** ESLint bulk suppressions. `npm run baseline:freeze` runs `eslint --suppress-all` and `--prune-suppressions` and writes `eslint-suppressions.json` (rule counts per file). A new violation fails the lint; fixing one lets the count drop. The file only shrinks: a file you touch must leave it.
  - Lint runs one ESLint process per workspace (`scripts/quality/lint.mjs`), because type-aware linting of the whole monorepo in one process runs out of memory. Each workspace needs a `tsconfig.json` that includes its sources and tests, or `projectService` cannot parse them.
- **Why:** bulk suppressions are built into ESLint (>= 9.24), need no plugin, and are what quality-kit's debt ratchet expects. Re-freezing (`baseline:freeze`) can raise counts, so it is a human step, as in CLAUDE.md.
- **Hooks:** lefthook runs oxfmt, ESLint and typecheck on commit, commitlint (conventional) on the message, and `npm run check` on push. gitleaks runs on commit when installed (`brew install gitleaks`); it is optional locally.
- **Later:** the user runs `/quality-kit:setup` to adopt the kit in team mode; it reads this config and the suppressions file.
