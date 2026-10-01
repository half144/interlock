import { Check } from "lucide-react";
import type { AuthProvider, ToolStatus } from "@/types";
import { AgentMark } from "@/components/ui/AgentMark/AgentMark";
import { Button } from "@/components/ui/Button/Button";
import { CommandHint } from "@/components/accounts/CommandHint/CommandHint";
import { TOOL_LABELS, stateOf } from "@/lib/diagnostics";
import { monoText, surface } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { LoginProgress } from "./LoginProgress/LoginProgress";
import { LogoutModal } from "./LogoutModal/LogoutModal";
import { subtitleOf } from "./subtitle";
import { useProviderCard } from "./useProviderCard";

export function ProviderCard({ tool }: { tool: ToolStatus & { id: AuthProvider } }) {
  const card = useProviderCard(tool);
  const state = stateOf(tool);

  return (
    <div className={cn(surface.frame, "flex flex-col gap-3 px-4 py-3.5")}>
      <div className="flex items-center gap-3">
        <AgentMark kind={tool.id} className="size-6" />
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-medium text-ink">{TOOL_LABELS[tool.id]}</p>
          <p className="truncate text-[12.5px] text-ink-3">{subtitleOf(tool)}</p>
        </div>
        {state === "ready" && (
          <>
            <span className="flex items-center gap-1 text-[12.5px] text-green">
              <Check className="size-3.5" /> Ready
            </span>
            <Button size="sm" variant="ghost" onClick={card.askLogout}>
              Log out
            </Button>
          </>
        )}
        {state === "needs-login" && !card.login && (
          <Button size="sm" variant="primary" onClick={card.logIn}>
            Log in
          </Button>
        )}
      </div>

      {state === "missing" && tool.installCommand && (
        <CommandHint label="Install it, then check again" command={tool.installCommand} />
      )}
      {card.login && (
        <LoginProgress
          login={card.login}
          onRetry={card.logIn}
          onCancel={card.cancel}
          onOpenLink={card.openLink}
        />
      )}
      {state === "needs-login" && tool.loginCommand && !card.busy && (
        <p className="text-[12.5px] text-ink-3">
          Or run <span className={monoText}>{tool.loginCommand}</span> in a terminal.
        </p>
      )}
      {card.confirmingLogout && (
        <LogoutModal
          name={TOOL_LABELS[tool.id]}
          onConfirm={card.confirmLogout}
          onClose={card.closeLogout}
        />
      )}
    </div>
  );
}
