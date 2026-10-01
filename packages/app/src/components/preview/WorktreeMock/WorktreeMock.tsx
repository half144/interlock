import { ScaledFrame } from "@/components/ui/ScaledFrame/ScaledFrame";
import { CheckoutMock } from "./CheckoutMock/CheckoutMock";
import { StorybookMock } from "./StorybookMock/StorybookMock";

/**
 * The page a web project's worktree renders, at its design width: the phone layout as it is, or the desktop
 * layout laid out at 1120px and scaled down to fit, so the preview tab and the finished-task card show the same page.
 */
export function WorktreeMock({
  projectId,
  compact = false,
}: {
  projectId: string;
  compact?: boolean;
}) {
  const Mock = projectId === "checkout" ? CheckoutMock : StorybookMock;
  if (compact) return <Mock compact />;
  return (
    <ScaledFrame width={1120}>
      <Mock />
    </ScaledFrame>
  );
}
