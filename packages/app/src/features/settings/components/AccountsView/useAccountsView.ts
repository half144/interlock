import { useStore } from "@/stores/app-store";
import { useTools } from "@/hooks/useTools";

export function useAccountsView() {
  const setSetup = useStore((s) => s.setSetup);
  return { ...useTools(), runSetup: () => setSetup("shown") };
}
