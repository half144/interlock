import { useRef, type ChangeEvent } from "react";
import { Plus } from "lucide-react";
import { RoundButton } from "@/components/ui/RoundButton/RoundButton";

export function AddFilesButton({ onPick }: { onPick: (files: File[]) => void }) {
  const input = useRef<HTMLInputElement>(null);

  const picked = (e: ChangeEvent<HTMLInputElement>) => {
    onPick(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  return (
    <>
      <RoundButton label="Add files" variant="outline" onClick={() => input.current?.click()}>
        <Plus />
      </RoundButton>
      <input ref={input} type="file" multiple hidden onChange={picked} />
    </>
  );
}
