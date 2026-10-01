import { AnimatePresence } from "motion/react";
import type { Agent } from "@/types";
import { CreatePrModal } from "@/components/ship/CreatePrModal/CreatePrModal";
import { PrModal } from "@/components/ship/PrModal/PrModal";
import { CreatePrButton } from "./CreatePrButton/CreatePrButton";
import { MergedPrButton } from "./MergedPrButton/MergedPrButton";
import { OpenPrButton } from "./OpenPrButton/OpenPrButton";
import { usePrButton } from "./usePrButton";

/** Ships the task: Create PR while it has none, then its number and checks, then Merged. */
export function PrButton({ agent }: { agent: Agent }) {
  const { pr, dialog, openCreate, openPr, close } = usePrButton(agent);

  return (
    <>
      {pr.phase === "none" && <CreatePrButton onClick={openCreate} />}
      {pr.phase === "open" && <OpenPrButton pr={pr} onClick={openPr} />}
      {pr.phase === "merged" && <MergedPrButton pr={pr} onClick={openPr} />}
      <AnimatePresence>
        {dialog === "create" && <CreatePrModal agent={agent} onClose={close} onCreated={openPr} />}
        {dialog === "pr" && <PrModal pr={pr} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
