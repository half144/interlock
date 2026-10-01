// Demo values for the project settings page; nothing here reaches a real shell or MCP server.

/** Environment variables per project, as [key, value] pairs. */
export const envVars: Record<string, [string, string][]> = {
  checkout: [
    ["NEXT_PUBLIC_API_URL", "http://localhost:4020"],
    ["STRIPE_SECRET_KEY", "sk_test_demo_4f2a9c"],
    ["SENTRY_DSN", "https://demo@sentry.example/12"],
  ],
  ledger: [
    ["DATABASE_URL", "postgres://ledger:demo@localhost:5432/ledger"],
    ["GATEWAY_API_KEY", "gw_test_demo_71b0"],
  ],
  uikit: [["FIGMA_TOKEN", "figd_demo_2c81"]],
  ingest: [
    ["KAFKA_BROKERS", "localhost:9092"],
    ["DD_API_KEY", "dd_demo_90e3"],
  ],
};

/** How many tools each MCP server exposes once connected. */
export const mcpToolCounts: Record<string, number> = {
  github: 38,
  linear: 22,
  sentry: 14,
  playwright: 21,
  postgres: 6,
  figma: 9,
  datadog: 17,
};

export const branches = ["main", "develop", "release/4.9"];
