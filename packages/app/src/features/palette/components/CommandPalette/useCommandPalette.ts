import { useStore } from "@/stores/app-store";

export const useCommandPalette = () => useStore((s) => s.paletteOpen);
