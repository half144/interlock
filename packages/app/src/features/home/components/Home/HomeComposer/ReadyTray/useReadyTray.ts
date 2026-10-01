import { useStore } from "@/stores/app-store";
import { setupStatus } from "@/features/home/utils/setupStatus";

export function useReadyTray() {
  const tools = useStore((s) => s.tools);
  const usage = useStore((s) => s.usage);
  const go = useStore((s) => s.go);
  return {
    status: tools && setupStatus(tools, usage),
    openAccounts: () => go({ kind: "accounts" }),
  };
}
