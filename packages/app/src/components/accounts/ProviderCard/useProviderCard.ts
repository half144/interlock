import { useState } from "react";
import { useStore } from "@/stores/app-store";
import { openExternal } from "@/platform/desktop";
import type { AuthProvider, ToolStatus } from "@/types";

export function useProviderCard(tool: ToolStatus & { id: AuthProvider }) {
  const login = useStore((s) => s.login);
  const startLogin = useStore((s) => s.startLogin);
  const cancelLogin = useStore((s) => s.cancelLogin);
  const logout = useStore((s) => s.logout);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const mine = login.phase !== "idle" && login.provider === tool.id ? login : null;

  return {
    login: mine,
    busy: login.phase === "starting" || login.phase === "waiting",
    confirmingLogout,
    logIn: () => void startLogin(tool.id),
    cancel: cancelLogin,
    openLink: (url: string) => void openExternal(url),
    askLogout: () => setConfirmingLogout(true),
    closeLogout: () => setConfirmingLogout(false),
    confirmLogout: () => {
      setConfirmingLogout(false);
      void logout(tool.id);
    },
  };
}
