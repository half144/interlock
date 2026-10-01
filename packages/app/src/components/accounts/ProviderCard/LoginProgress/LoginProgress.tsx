import { Loader2 } from "lucide-react";
import type { LoginState } from "@/types";
import { Button } from "@/components/ui/Button/Button";

interface LoginProgressProps {
  login: Exclude<LoginState, { phase: "idle" }>;
  onRetry: () => void;
  onCancel: () => void;
  onOpenLink: (url: string) => void;
}

/** Where a login stands: starting, waiting for the browser, or failed with a way to try again. */
export function LoginProgress({ login, onRetry, onCancel, onOpenLink }: LoginProgressProps) {
  if (login.phase === "starting") {
    return (
      <p className="flex items-center gap-2 text-[13px] text-ink-3">
        <Loader2 className="size-3.5 animate-spin" /> Starting the login…
      </p>
    );
  }
  if (login.phase === "waiting") {
    const { authUrl } = login;
    return (
      <div className="flex items-center gap-3 text-[13px] text-ink-2">
        <Loader2 className="size-3.5 shrink-0 animate-spin text-ink-3" />
        <span className="min-w-0 flex-1 [text-wrap:pretty]">
          Waiting for you to finish signing in in the browser.
        </span>
        {authUrl && (
          <Button size="sm" onClick={() => onOpenLink(authUrl)}>
            Open the page again
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }
  return (
    <div role="alert" className="flex items-center gap-3 text-[13px] text-red">
      <span className="min-w-0 flex-1 [text-wrap:pretty]">{login.message}</span>
      <Button size="sm" onClick={onRetry}>
        Try again
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        Dismiss
      </Button>
    </div>
  );
}
