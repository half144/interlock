import {
  Accessibility,
  Compass,
  DatabaseZap,
  FlaskConical,
  Network,
  ScanEye,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { SubagentRole } from "@/types";

export const roleIcon: Record<SubagentRole, LucideIcon> = {
  explore: Compass,
  tests: FlaskConical,
  review: ShieldCheck,
  migration: DatabaseZap,
  a11y: Accessibility,
  visual: ScanEye,
  schema: Network,
};
