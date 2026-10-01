import { useStore } from "@/stores/app-store";

export function useSidebar() {
  const viewKind = useStore((s) => s.view.kind);
  const newTask = useStore((s) => s.newTask);
  const setPalette = useStore((s) => s.setPalette);

  return {
    onHome: viewKind === "yard",
    newTask: () => newTask(),
    search: () => setPalette(true),
  };
}
