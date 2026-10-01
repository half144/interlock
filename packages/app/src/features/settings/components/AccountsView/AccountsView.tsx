import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { ProviderCard } from "@/components/accounts/ProviderCard/ProviderCard";
import { ToolLine } from "@/components/accounts/ToolLine/ToolLine";
import { useAccountsView } from "./useAccountsView";

export function AccountsView() {
  const { tools, error, checking, recheck, git, gh, providers, runSetup } = useAccountsView();

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-[720px] flex-col gap-8 px-8 pt-8 pb-24">
        <header className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-[24px] text-ink">Accounts</h1>
            <p className="mt-1 text-[13px] text-ink-3">
              Interlock uses the logins of the Claude Code and Codex command line tools already on
              this Mac. It never stores or copies your credentials.
            </p>
          </div>
          <Button size="sm" icon={<RefreshCw />} disabled={checking} onClick={() => void recheck()}>
            Check again
          </Button>
        </header>

        {error && (
          <p role="alert" className="text-[13px] text-red">
            {error}
          </p>
        )}
        {!tools && !error && <p className="text-[13px] text-ink-3">Checking this Mac…</p>}

        {tools && (
          <>
            <section aria-labelledby="agents-title" className="flex flex-col gap-3">
              <h2 id="agents-title" className="text-[15px] font-medium text-ink">
                Agents
              </h2>
              {providers.map((tool) => (
                <ProviderCard key={tool.id} tool={tool} />
              ))}
            </section>
            <section aria-labelledby="tools-title" className="flex flex-col gap-3">
              <h2 id="tools-title" className="text-[15px] font-medium text-ink">
                Tools
              </h2>
              {git && <ToolLine tool={git} note="Every task runs in its own git worktree." />}
              {gh && <ToolLine tool={gh} note="Opens pull requests and reads their checks." />}
            </section>
            <div>
              <Button variant="ghost" size="sm" onClick={runSetup}>
                Run first-time setup again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
