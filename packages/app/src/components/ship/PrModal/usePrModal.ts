import { openExternal } from "@/platform/desktop";
import { useStore } from "@/stores/app-store";
import type { PullRequestView } from "@/lib/pullRequest";

export function usePrModal(pr: PullRequestView, onClose: () => void) {
  const openPanel = useStore((s) => s.openPanel);

  return {
    openOnGitHub: () => {
      if (pr.url) void openExternal(pr.url);
    },
    showChecks: () => {
      openPanel("checks");
      onClose();
    },
  };
}
