const DAYS = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

const at = (h: string, m: string) => `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;

/** Human echo for the handful of cron shapes people actually type. */
export function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Needs five fields: minute hour day month weekday";
  const [m = "", h = "", dom = "", mon = "", dow = ""] = parts;
  const every = m.match(/^\*\/(\d+)$/);
  if (every && h === "*" && dom === "*" && mon === "*" && dow === "*")
    return `Every ${every[1]} minutes`;
  if (!/^\d+$/.test(m) || !/^\d+$/.test(h)) return "Custom schedule";
  if (dom === "*" && mon === "*") {
    if (dow === "*") return `Every day at ${at(h, m)}`;
    if (dow === "1-5") return `Every weekday at ${at(h, m)}`;
    if (/^[0-6]$/.test(dow)) return `${DAYS[Number(dow)]} at ${at(h, m)}`;
  }
  return "Custom schedule";
}
