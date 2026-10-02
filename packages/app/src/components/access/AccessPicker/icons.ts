import { ListChecks, ShieldAlert, ShieldCheck, type LucideIcon } from "lucide-react";
import type { Access } from "@/types";

export const ACCESS_ICONS: Record<Access, LucideIcon> = {
  plan: ListChecks,
  auto: ShieldCheck,
  "full-auto": ShieldAlert,
};
