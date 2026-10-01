import { useState, type KeyboardEvent } from "react";
import type { Subagent } from "@/types";
import { useStore } from "@/stores/app-store";

export function useSubagentComposer(sub: Subagent) {
  const messageSubagent = useStore((s) => s.messageSubagent);
  const [text, setText] = useState("");
  const message = text.trim();

  const send = () => {
    if (!message) return;
    void messageSubagent(sub.id, message);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return { text, setText, send, onKeyDown, canSend: message !== "" };
}
