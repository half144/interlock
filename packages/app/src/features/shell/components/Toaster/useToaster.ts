import { useStore } from "@/stores/app-store";

export const useToaster = () => useStore((s) => s.toasts);
