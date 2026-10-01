import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";

interface BackdropProps {
  onClose: () => void;
  align?: "center" | "top";
  children: ReactNode;
}

/**
 * The layer under every dialog. After Manus, the app dims and blurs out of focus behind it, so the
 * dialog is the only sharp thing on screen. It renders on the body so no ancestor can clip or offset it.
 */
export function Backdrop({ onClose, align = "center", children }: BackdropProps) {
  return createPortal(
    <motion.div
      className={cn(
        "fixed inset-0 z-50 flex justify-center bg-black/45 backdrop-blur-[6px]",
        align === "center" ? "items-center" : "items-start pt-[14vh]",
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: fadeIn }}
      exit={{ opacity: 0, transition: fadeOut }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </motion.div>,
    document.body,
  );
}
