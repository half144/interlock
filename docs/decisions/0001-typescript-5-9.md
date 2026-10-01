# 0001 — TypeScript 5.9 across the monorepo

- **Context:** the prototype used TypeScript 7; the Paseo packages use 5.9, and typescript-eslint's type-aware linting (required by quality-kit and our gate) runs on the TypeScript 5 compiler API.
- **Decision:** one TypeScript version, `^5.9.3`, for every workspace package.
- **Why:** a single compiler for typecheck and type-aware lint, with no per-package drift.
