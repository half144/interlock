import { useEffect } from "react";
import { setActivity, setFocusedTask } from "../desktop";

export function useActivitySync(running: number, waiting: number): void {
  useEffect(() => {
    void setActivity({ running, waiting });
  }, [running, waiting]);
}

export function useFocusedTaskSync(taskId: string | null): void {
  useEffect(() => {
    void setFocusedTask(taskId);
    return () => {
      void setFocusedTask(null);
    };
  }, [taskId]);
}
