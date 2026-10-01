import { useEffect, useId, useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { easeOut, fadeOut } from "@/lib/motion";
import { useEscape } from "@/hooks/useEscape";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { Backdrop } from "../Backdrop/Backdrop";
import { IconButton } from "../IconButton/IconButton";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** A centred dialog in Manus's anatomy: title and close on top, content, then actions bottom-right. */
export function Modal({ title, onClose, children, footer, className }: ModalProps) {
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(dialog);
  useEscape(onClose);

  // Focus starts on the dialog itself, so Tab begins inside it and screen readers announce the title.
  useEffect(() => dialog.current?.focus(), []);

  return (
    <Backdrop onClose={onClose}>
      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.97, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.24, ease: easeOut } }}
        exit={{ opacity: 0, scale: 0.98, transition: fadeOut }}
        className={cn(
          "w-[440px] rounded-[20px] border border-seam bg-raised shadow-overlay outline-none",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4 pt-5 pr-4 pb-1 pl-6">
          <h2 id={titleId} className="text-[17px] font-semibold text-ink">
            {title}
          </h2>
          <IconButton label="Close" onClick={onClose}>
            <X />
          </IconButton>
        </div>
        <div className="px-6 pt-3 pb-6">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-6 pb-5">{footer}</div>}
      </motion.div>
    </Backdrop>
  );
}
