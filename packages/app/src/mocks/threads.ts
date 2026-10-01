import type { Thread } from "@/types";

export const threads: Thread[] = [
  {
    id: "t-session",
    projectId: "checkout",
    title: "Checkout drops carts after token refresh",
    updatedMin: 2,
    agentIds: ["CHK-41"],
    messages: [
      {
        id: "m1",
        role: "user",
        minAgo: 19,
        text: "Sentry is showing CART_NOT_FOUND spikes right after token refresh on /checkout. Find the race and fix it. Keep the public API of useCart stable.",
      },
      {
        id: "m2",
        role: "agent",
        agentId: "CHK-41",
        minAgo: 18,
        blocks: [
          {
            type: "text",
            text: "On it. I’ll trace where the refresh happens, reproduce the race in a test, and fix it without changing how `useCart` is called.",
          },
          {
            type: "delegate",
            agentId: "CHK-41",
            subagentIds: ["CHK-41.1", "CHK-41.2", "CHK-41.3"],
          },
          {
            type: "step",
            text: "Trace the refresh flow",
            status: "completed",
            detail:
              "`refreshSession()` is called from both the focus listener and the 401 interceptor. When both fire, the second call rotates the token the first request is still using, so the server drops the cart binding.",
            tools: [
              { tool: "search", label: "Searched for refreshSession · 7 results" },
              { tool: "read", label: "Read refresh.ts, useCart.ts, middleware.ts" },
            ],
          },
          {
            type: "step",
            text: "Collapse concurrent refreshes and retry once",
            status: "completed",
            detail:
              "Overlapping calls now share one in-flight promise, and cart mutations retry once after a successful refresh.",
            tools: [
              { tool: "edit", label: "Edited src/lib/session/refresh.ts" },
              { tool: "edit", label: "Edited src/app/checkout/useCart.ts" },
            ],
          },
          {
            type: "step",
            text: "Cover it with a regression test",
            status: "completed",
            detail: "Three overlapping refreshes now make exactly one request.",
            tools: [
              { tool: "edit", label: "Created src/lib/session/refresh.test.ts" },
              { tool: "bash", label: "Ran pnpm vitest session · 11 passed" },
            ],
          },
          {
            type: "text",
            text: "The race is fixed and covered. One product decision is left before I run the e2e suite.",
          },
          { type: "hold", agentId: "CHK-41" },
        ],
      },
    ],
  },
  {
    id: "t-autocomplete",
    projectId: "checkout",
    title: "Address autocomplete redesign",
    updatedMin: 1,
    agentIds: ["CHK-38"],
    messages: [
      {
        id: "m1",
        role: "user",
        minAgo: 42,
        text: "Redesign the address field: debounced search, keyboard navigation, a manual entry fallback, and no layout shift when suggestions open.",
      },
      {
        id: "m2",
        role: "agent",
        agentId: "CHK-38",
        minAgo: 41,
        blocks: [
          {
            type: "text",
            text: "Got it! I’ll rebuild the field around the ARIA combobox pattern and verify it in the preview at mobile and desktop widths.",
          },
          { type: "delegate", agentId: "CHK-38", subagentIds: ["CHK-38.1", "CHK-38.2"] },
          {
            type: "step",
            text: "Rebuild the field as an accessible combobox",
            status: "completed",
            detail:
              "Arrow keys, Home/End and Escape follow the ARIA combobox pattern; “Enter address manually” is always the last option.",
            tools: [
              { tool: "edit", label: "Edited AddressField.tsx" },
              { tool: "edit", label: "Created useAddressSearch.ts" },
            ],
          },
          {
            type: "step",
            text: "Reserve space so the form never shifts",
            status: "completed",
            detail:
              "The listbox renders in a reserved slot, so opening suggestions never moves the Continue button.",
            tools: [{ tool: "web", label: "Checked preview at 390px and 1280px" }],
          },
          {
            type: "step",
            text: "Run the address tests",
            status: "completed",
            tools: [{ tool: "bash", label: "Ran pnpm test address · 24 passed" }],
          },
          {
            type: "text",
            text: "Everything is in place and the tests pass. Here is what changed.",
          },
          { type: "changes", agentId: "CHK-38" },
          {
            type: "followups",
            items: [
              "Open a pull request for this change",
              "Add an e2e test for manual entry",
              "Show recent addresses before typing",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "t-react",
    projectId: "checkout",
    title: "React 19.2 upgrade",
    updatedMin: 170,
    agentIds: ["CHK-35"],
    messages: [
      {
        id: "m1",
        role: "user",
        minAgo: 191,
        text: "Upgrade React to 19.2 and clean up the hydration warnings on the product page.",
      },
      {
        id: "m2",
        role: "agent",
        agentId: "CHK-35",
        minAgo: 170,
        blocks: [
          {
            type: "step",
            text: "Upgrade React and fix hydration warnings",
            status: "completed",
            detail:
              "The two warnings came from `Date.now()` in the promo banner; it now renders on the client only.",
            tools: [
              { tool: "bash", label: "Ran pnpm up react react-dom" },
              { tool: "edit", label: "Edited src/app/layout.tsx" },
            ],
          },
          { type: "text", text: "Upgraded and merged as #1842." },
          { type: "changes", agentId: "CHK-35" },
        ],
      },
    ],
  },
  {
    id: "t-refunds",
    projectId: "ledger",
    title: "Idempotency keys for refunds",
    updatedMin: 1,
    agentIds: ["LED-112"],
    messages: [
      {
        id: "m1",
        role: "user",
        minAgo: 13,
        text: "Add idempotency keys to POST /refunds so retried requests never refund twice.",
      },
      {
        id: "m2",
        role: "agent",
        agentId: "LED-112",
        minAgo: 12,
        blocks: [
          {
            type: "text",
            text: "I’ll store a key per charge, return the original refund on a replay, and pass the key through to the payment gateway.",
          },
          {
            type: "delegate",
            agentId: "LED-112",
            subagentIds: ["LED-112.1", "LED-112.2", "LED-112.3"],
          },
          {
            type: "step",
            text: "Read the refund service and routes",
            activeForm: "Reading the refund service and routes",
            status: "completed",
            tools: [{ tool: "read", label: "Read src/refunds/service.ts, routes.ts" }],
          },
          {
            type: "step",
            text: "Add the refund_keys table",
            activeForm: "Adding the refund_keys table",
            status: "in_progress",
            detail: "Writing migration 0142 with a composite key on (key, charge_id).",
            tools: [{ tool: "edit", label: "Creating migrations/0142_refund_keys.sql" }],
          },
          {
            type: "step",
            text: "Make refunds transactional and replay-safe",
            activeForm: "Making refunds transactional and replay-safe",
            status: "pending",
          },
          {
            type: "step",
            text: "Test replays and concurrent requests",
            activeForm: "Testing replays and concurrent requests",
            status: "pending",
          },
        ],
      },
    ],
  },
  {
    id: "t-webhooks",
    projectId: "ledger",
    title: "Refund webhook retries",
    updatedMin: 2,
    agentIds: ["LED-113"],
    messages: [
      {
        id: "m1",
        role: "user",
        minAgo: 10,
        text: "Refund webhooks fail silently when the merchant endpoint is down. Retry with exponential backoff.",
      },
      {
        id: "m2",
        role: "agent",
        agentId: "LED-113",
        minAgo: 9,
        blocks: [
          {
            type: "text",
            text: "I’ll add capped exponential backoff with full jitter and stop after six attempts.",
          },
          {
            type: "step",
            text: "Find where webhooks are delivered",
            status: "in_progress",
            tools: [{ tool: "read", label: "Reading src/refunds/service.ts" }],
          },
          { type: "step", text: "Add backoff with jitter", status: "pending" },
          { type: "step", text: "Test retries against a failing endpoint", status: "pending" },
        ],
      },
    ],
  },
  {
    id: "t-sentry",
    projectId: "ledger",
    title: "Nightly Sentry triage",
    updatedMin: 380,
    agentIds: ["LED-109"],
    messages: [
      {
        id: "m1",
        role: "agent",
        agentId: "LED-109",
        minAgo: 380,
        blocks: [
          {
            type: "text",
            text: "Scheduled run at 03:00. 4 new issues, 3 were duplicates of known noise. One real bug: payout amounts in 3-decimal currencies were rounded to 2 places.",
          },
          {
            type: "step",
            text: "Fix rounding for 3-decimal currencies",
            status: "completed",
            tools: [
              { tool: "edit", label: "Edited src/payouts/format.ts" },
              { tool: "bash", label: "Ran pnpm test payouts · 42 passed" },
            ],
          },
          { type: "changes", agentId: "LED-109" },
          {
            type: "followups",
            items: ["Open a pull request", "Add BHD and KWD to the payout fixtures"],
          },
        ],
      },
    ],
  },
  {
    id: "t-focus",
    projectId: "uikit",
    title: "Focus ring tokens",
    updatedMin: 3,
    agentIds: ["KIT-27"],
    messages: [
      {
        id: "m1",
        role: "user",
        minAgo: 28,
        text: "Move every focus ring to a token and audit the interactive components for WCAG 2.2 focus appearance.",
      },
      {
        id: "m2",
        role: "agent",
        agentId: "KIT-27",
        minAgo: 3,
        blocks: [
          {
            type: "step",
            text: "Tokenize focus rings across 14 components",
            status: "completed",
            detail:
              "All interactive components now use `--focus-ring`. Two failed the 3:1 contrast check and are fixed.",
            tools: [
              { tool: "edit", label: "Edited 11 files" },
              { tool: "bash", label: "Ran pnpm test · 57 passed" },
            ],
          },
          { type: "text", text: "I want to cut the release changeset next." },
          { type: "hold", agentId: "KIT-27" },
        ],
      },
    ],
  },
  {
    id: "t-combobox",
    projectId: "uikit",
    title: "Combobox keyboard navigation",
    updatedMin: 3,
    agentIds: ["KIT-28"],
    messages: [
      {
        id: "m1",
        role: "user",
        minAgo: 3,
        text: "Combobox should support Home/End and type-ahead like the native select.",
      },
      {
        id: "m2",
        role: "agent",
        agentId: "KIT-28",
        minAgo: 3,
        blocks: [
          {
            type: "text",
            text: "Queued. Focus ring tokens is editing Button.tsx too, so I’ll start as soon as it finishes to avoid a conflict.",
          },
        ],
      },
    ],
  },
  {
    id: "t-backfill",
    projectId: "ingest",
    title: "Orphaned events backfill",
    updatedMin: 5,
    agentIds: ["ING-15"],
    messages: [
      {
        id: "m1",
        role: "user",
        minAgo: 7,
        text: "About 1.2M events landed without an account_id after Tuesday’s deploy. Backfill them from the session table. Plan first: dry run, and it must be resumable.",
      },
      {
        id: "m2",
        role: "agent",
        agentId: "ING-15",
        minAgo: 5,
        blocks: [
          {
            type: "text",
            text: "I sent two read-only subagents to size the problem first. Here’s the plan; nothing will be written until you approve it.",
          },
          { type: "delegate", agentId: "ING-15", subagentIds: ["ING-15.1", "ING-15.2"] },
          {
            type: "step",
            text: "Count orphaned events per partition (read-only)",
            status: "pending",
          },
          {
            type: "step",
            text: "Build the session → account lookup as a temp table",
            status: "pending",
          },
          { type: "step", text: "Dry run on one partition and diff the result", status: "pending" },
          {
            type: "step",
            text: "Backfill in batches of 5,000, committing the offset per batch",
            status: "pending",
          },
          { type: "step", text: "Verify counts and drop the temp table", status: "pending" },
          { type: "hold", agentId: "ING-15" },
        ],
      },
    ],
  },
];
