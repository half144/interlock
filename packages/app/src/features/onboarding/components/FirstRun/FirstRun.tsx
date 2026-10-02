import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { LogoMark } from "@/components/ui/LogoMark/LogoMark";
import { ProviderCard } from "@/components/accounts/ProviderCard/ProviderCard";
import { ToolLine } from "@/components/accounts/ToolLine/ToolLine";
import { useFirstRun } from "./useFirstRun";

/** Shown over the app while git or every agent is missing, and whenever Accounts asks for it. */
export function FirstRun() {
  const { visible, ready, git, gh, providers, checking, recheck, close } = useFirstRun();
  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="First-time setup"
      className="fixed inset-0 z-40 overflow-y-auto bg-ground"
    >
      <div data-tauri-drag-region className="fixed inset-x-0 top-0 h-12" />
      <div className="mx-auto flex max-w-[560px] flex-col gap-6 px-6 py-16">
        <LogoMark />
        <header>
          <h1 className="font-serif text-[28px] text-ink">Let’s get your machine ready</h1>
          <p className="mt-2 text-[14px] leading-[1.55] text-ink-3 [text-wrap:pretty]">
            Interlock runs the Claude Code and Codex tools you already have, each task in its own
            git worktree. It needs git and at least one agent signed in.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          {git && <ToolLine tool={git} note="Required. Every task runs in a git worktree." />}
          {providers.map((tool) => (
            <ProviderCard key={tool.id} tool={tool} />
          ))}
          {gh && (
            <ToolLine tool={gh} note="Optional. Opens pull requests and reads their checks." />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" disabled={!ready} onClick={close}>
            Continue
          </Button>
          <Button icon={<RefreshCw />} disabled={checking} onClick={() => void recheck()}>
            Check again
          </Button>
          {!ready && (
            <Button variant="ghost" className="ml-auto" onClick={close}>
              Set up later
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
