import { useId } from "react";
import type { AuthProvider, ToolStatus } from "@/types";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";
import { fieldLabel, monoText } from "@/lib/styles";
import { cn } from "@/lib/utils";
import { useExecutableField } from "./useExecutableField";

export function ExecutableField({ tool }: { tool: ToolStatus & { id: AuthProvider } }) {
  const id = useId();
  const vm = useExecutableField(tool);
  return (
    <form
      className="flex flex-col gap-2 border-t border-seam pt-3"
      onSubmit={(event) => void vm.save(event)}
    >
      <label htmlFor={id} className={fieldLabel}>
        Executable
      </label>
      <div className="flex gap-2">
        <Input
          id={id}
          mono
          className="min-w-0 flex-1"
          value={vm.value}
          onChange={vm.change}
          disabled={vm.busy}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
          aria-invalid={!!vm.error}
          aria-describedby={`${id}-hint`}
          list={`${id}-options`}
        />
        <datalist id={`${id}-options`}>
          <option value={tool.id} />
        </datalist>
        <Button size="sm" type="submit" disabled={!vm.canSave}>
          {vm.saving ? "Saving…" : "Save"}
        </Button>
      </div>
      <p id={`${id}-hint`} className="text-[12.5px] text-ink-3">
        Command name or full path. Used for login and new tasks on this Mac.
      </p>
      {vm.error && (
        <p role="alert" className="text-[12.5px] text-red">
          {vm.error}
        </p>
      )}
      {!vm.error && vm.saved && (
        <p role="status" className="text-[12.5px] text-green">
          Executable saved.
        </p>
      )}
      {!vm.dirty && (
        <p className={cn(monoText, "break-all text-ink-3")}>
          {tool.path ?? "Executable not found. Check the name or enter its full path."}
        </p>
      )}
    </form>
  );
}
