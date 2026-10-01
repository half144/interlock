import { useEffect, useState } from "react";
import { onDaemonStatus } from "../desktop";
import type { DaemonStatus } from "../types";

export function useDaemonStatus(initial: DaemonStatus = "starting"): DaemonStatus {
  const [status, setStatus] = useState(initial);
  useEffect(() => onDaemonStatus(setStatus), []);
  return status;
}
