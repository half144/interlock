import { describe, expect, it } from "vitest";
import type { Agent } from "@/types";
import type { PaletteGroup, PaletteItem } from "@/features/palette/types";
import { selectPaletteItems } from "./selectItems";

const item = (
  id: string,
  group: PaletteGroup,
  title: string,
  extra: Partial<PaletteItem> = {},
) => ({
  id,
  group,
  title,
  run: () => undefined,
  ...extra,
});

describe("selectPaletteItems", () => {
  const all = [
    item("c", "Commands", "New task"),
    ...Array.from({ length: 9 }, (_, i) => item(`t${i}`, "Threads", `Fix bug ${i}`)),
    item("n", "Needs you", "Approve migration", { hint: "ledger" }),
  ];

  it("orders groups and caps each one when idle", () => {
    const ids = selectPaletteItems(all, "").map((i) => i.id);
    expect(ids[0]).toBe("n");
    expect(ids.filter((id) => id.startsWith("t"))).toHaveLength(6);
    expect(ids.at(-1)).toBe("c");
  });

  it("matches title, hint and branch ignoring case", () => {
    expect(selectPaletteItems(all, " LEDGER ").map((i) => i.id)).toEqual(["n"]);
    const withBranch = item("b", "Threads", "Other", {
      agent: { branch: "agent/x-login", headcode: "AB-1" } as Agent,
    });
    expect(selectPaletteItems([withBranch], "login")).toHaveLength(1);
  });

  it("is empty when nothing matches", () => {
    expect(selectPaletteItems(all, "zzz")).toEqual([]);
  });
});
