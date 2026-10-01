interface Exchange {
  method: string;
  path: string;
  headers: [string, string][];
  body?: string;
  status: string;
  timing: string;
  response: string;
  replay?: string;
}

export const refunds: Exchange = {
  method: "POST",
  path: "/refunds",
  headers: [
    ["Content-Type", "application/json"],
    ["Authorization", "Bearer sk_test_••••••••3f9a"],
    ["Idempotency-Key", "7f3c9a2e-4b1d-4e8a-9c55-0d2f6b18a41e"],
  ],
  body: `{
  "chargeId": "ch_3PqL8x2eZvKYlo2C",
  "amount": 4200,
  "reason": "requested_by_customer"
}`,
  status: "201 Created",
  timing: "84 ms",
  response: `{
  "id": "rf_01J9ZK4M2Q8T",
  "chargeId": "ch_3PqL8x2eZvKYlo2C",
  "amount": 4200,
  "status": "pending",
  "createdAt": "2026-09-30T14:02:11Z"
}`,
  replay: "Replayed with the same key: 200 OK, same refund id, no second gateway call.",
};

export const backfill: Exchange = {
  method: "GET",
  path: "/jobs/backfill/status",
  headers: [["Authorization", "Bearer sk_test_••••••••7c21"]],
  status: "200 OK",
  timing: "12 ms",
  response: `{
  "job": "orphan-backfill",
  "mode": "dry-run",
  "partitions": 48,
  "orphaned": 1204331,
  "batchSize": 5000,
  "lastCommittedOffset": null
}`,
};
