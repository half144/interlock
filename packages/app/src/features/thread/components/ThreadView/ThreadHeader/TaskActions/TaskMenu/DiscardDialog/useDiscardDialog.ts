import { useState } from "react";
import { useStore } from "@/stores/app-store";

export function useDiscardDialog(agentId: string, onClose: () => void) {
  const discard = useStore((s) => s.discard);
  const [discarding, setDiscarding] = useState(false);

  const confirm = () => {
    setDiscarding(true);
    void discard(agentId).finally(() => {
      setDiscarding(false);
      onClose();
    });
  };

  return { discarding, confirm };
}
