import { useState, type SyntheticEvent } from "react";

export function useAddProjectDialog(
  initialPath: string,
  onSubmit: (path: string) => Promise<void>,
) {
  const [path, setPath] = useState(initialPath);
  const [busy, setBusy] = useState(false);

  const submit = (event: SyntheticEvent) => {
    event.preventDefault();
    setBusy(true);
    void onSubmit(path).finally(() => setBusy(false));
  };

  return { path, setPath, busy, canSubmit: path.trim() !== "" && !busy, submit };
}
