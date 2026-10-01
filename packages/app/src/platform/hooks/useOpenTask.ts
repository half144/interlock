import { useEffect, useRef } from "react";
import { onOpenTask } from "../desktop";

export function useOpenTask(callback: (taskId: string) => void): void {
  const latest = useRef(callback);
  latest.current = callback;
  useEffect(() => onOpenTask((taskId) => latest.current(taskId)), []);
}
