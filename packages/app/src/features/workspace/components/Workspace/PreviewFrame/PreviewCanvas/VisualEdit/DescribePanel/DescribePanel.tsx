import { useState } from "react";
import { motion } from "motion/react";
import { CornerDownLeft, X } from "lucide-react";
import type { Agent } from "@/types";
import { useStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { Tabs } from "@/components/ui/Tabs/Tabs";
import { surface } from "@/lib/styles";
import type { Hotspot } from "@/features/workspace/utils/hotspots";
import { LayoutProperties } from "./LayoutProperties/LayoutProperties";
import { StyleProperties } from "./StyleProperties/StyleProperties";

type Section = "style" | "layout";

const TABS: { value: Section; label: string }[] = [
  { value: "style", label: "Style" },
  { value: "layout", label: "Layout" },
];

/** Say what should change about the region you picked; it goes to the agent as a follow-up. */
export function DescribePanel({
  spot,
  agent,
  onClose,
}: {
  spot: Hotspot;
  agent: Agent;
  onClose: () => void;
}) {
  const sendMessage = useStore((s) => s.sendMessage);
  const [text, setText] = useState("");
  const [tab, setTab] = useState<Section>("style");

  const send = () => {
    if (!text.trim()) return;
    sendMessage(agent.threadId, `${spot.name}: ${text.trim()}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: fadeIn }}
      exit={{ opacity: 0, y: 4, transition: fadeOut }}
      className={cn(surface.frame, "absolute top-3 right-3 z-20 w-[300px] shadow-overlay")}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 border-b border-seam py-2 pr-1.5 pl-3">
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Describe a change"
          aria-label={`Describe a change to the ${spot.name.toLowerCase()}`}
          className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink outline-none placeholder:text-ink-3"
        />
        <IconButton label="Close" onClick={onClose}>
          <X />
        </IconButton>
      </div>
      <div className="px-3 pt-2.5">
        <Tabs value={tab} onChange={setTab} items={TABS} />
      </div>
      {tab === "style" ? <StyleProperties spot={spot} /> : <LayoutProperties />}
      <p className="flex items-center gap-1.5 border-t border-seam px-3 py-2 text-[12px] text-ink-3">
        <CornerDownLeft className="size-3" />
        Sends to {agent.headcode} as a follow-up
      </p>
    </motion.div>
  );
}
