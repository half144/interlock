import type { ButtonHTMLAttributes } from "react";
import { ArrowUp } from "lucide-react";
import { RoundButton } from "../RoundButton/RoundButton";

/** Every composer's send button: solid, disabled until there's something to send. */
export function SendButton({
  label = "Send",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label?: string }) {
  return (
    <RoundButton label={label} variant="solid" {...rest}>
      <ArrowUp strokeWidth={2.4} />
    </RoundButton>
  );
}
