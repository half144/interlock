import { useStore } from "@/stores/app-store";
import { providerView, USAGE_KINDS } from "@/lib/usage";

export function useUsagePill() {
  const usage = useStore((s) => s.usage);
  const now = Date.now();

  return {
    providers: USAGE_KINDS.map((kind) =>
      providerView(
        kind,
        usage.find((u) => u.kind === kind),
        now,
      ),
    ),
  };
}
