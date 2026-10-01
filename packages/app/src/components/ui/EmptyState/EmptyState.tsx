import type { LucideIcon } from "lucide-react";
import { Button } from "../Button/Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 text-center">
      <Icon className="size-6 text-ink-2" strokeWidth={1.75} />
      <p className="mt-3 text-[15px] font-medium text-ink">{title}</p>
      <p className="mt-1 max-w-[340px] text-[13.5px] leading-[1.55] text-ink-3 [text-wrap:pretty]">
        {description}
      </p>
      {action && (
        <Button size="sm" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
