import { byId } from "@/lib/utils";
import type { Project } from "@/types";

export const projects: [Project, ...Project[]] = [
  {
    id: "checkout",
    key: "CHK",
    name: "checkout-web",
    repo: "lumen/checkout-web",
    defaultBranch: "main",
    stack: "Next.js 16 · TypeScript",
    setupScript:
      "pnpm install --frozen-lockfile\ncp $ROOT/.env.local .env.local\npnpm db:seed --fixtures checkout",
    runScript: "pnpm dev --port $PORT",
    port: 3107,
    mcp: ["github", "linear", "sentry", "playwright"],
    skills: ["frontend-review", "a11y-audit", "changeset"],
    budget: 40,
  },
  {
    id: "ledger",
    key: "LED",
    name: "ledger-api",
    repo: "lumen/ledger-api",
    defaultBranch: "main",
    stack: "Fastify · Postgres",
    setupScript: "pnpm install\ndocker compose up -d postgres\npnpm migrate:latest",
    runScript: "pnpm start:dev --port $PORT",
    port: 4020,
    mcp: ["github", "sentry", "postgres"],
    skills: ["api-contracts", "migration-safety"],
    budget: 60,
  },
  {
    id: "uikit",
    key: "KIT",
    name: "ui-kit",
    repo: "lumen/ui-kit",
    defaultBranch: "main",
    stack: "React · Storybook",
    setupScript: "pnpm install",
    runScript: "pnpm storybook --port $PORT",
    port: 6006,
    mcp: ["github", "figma"],
    skills: ["a11y-audit", "changeset"],
    budget: 25,
  },
  {
    id: "ingest",
    key: "ING",
    name: "ingest",
    repo: "lumen/ingest",
    defaultBranch: "main",
    stack: "Node workers · Kafka",
    setupScript: "pnpm install\ndocker compose up -d kafka",
    runScript: "pnpm worker:dev",
    port: 4300,
    mcp: ["github", "datadog"],
    skills: ["migration-safety"],
    budget: 30,
  },
];

export const projectById = byId(projects);

/** The project for an id, or the first one when the id is unknown. */
export const projectOf = (projectId: string): Project => projectById[projectId] ?? projects[0];

/** API projects have no page to render; their preview is a live request instead. */
export const isApiProject = (projectId: string) => projectId === "ledger" || projectId === "ingest";
