import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuItem } from "../MenuItem/MenuItem";
import type { PickerOption } from "@/lib/options";
import { Popover } from "../Popover/Popover";
import { field, monoText } from "@/lib/styles";

interface PickerProps<T extends string> {
  value: T;
  options: PickerOption<T>[];
  onChange: (value: T) => void;
  label: string;
  mono?: boolean;
  className?: string;
}

/** Select built on the anchored Popover, filled like a text field, with a down caret. Its menu is at least as wide as the field and grows leftwards for long options. */
export function Picker<T extends string>({
  value,
  options,
  onChange,
  label,
  mono,
  className,
}: PickerProps<T>) {
  const current = options.find((o) => o.value === value);
  return (
    <Popover
      align="end"
      className="max-h-72 w-max max-w-[360px] min-w-full overflow-y-auto"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={toggle}
          className={cn(
            field,
            "flex h-9 w-full items-center gap-2 px-3 text-left hover:bg-selected aria-expanded:bg-selected",
            className,
          )}
        >
          <span className={cn("min-w-0 flex-1 truncate", mono && monoText)}>
            {current?.label ?? value}
          </span>
          <ChevronDown className="size-4 shrink-0 text-ink-3" />
        </button>
      )}
    >
      {(close) =>
        options.map((o) => (
          <MenuItem
            key={o.value}
            active={o.value === value}
            hint={o.hint}
            onSelect={() => {
              onChange(o.value);
              close();
            }}
          >
            <span className={cn("truncate", mono && monoText)}>{o.label}</span>
            {o.value === value && !o.hint && <Check className="ml-auto text-ink-2" />}
          </MenuItem>
        ))
      }
    </Popover>
  );
}
