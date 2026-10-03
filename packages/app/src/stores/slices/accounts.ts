import type { AuthProvider, LoginState, ToolStatus } from "@/types";
import * as daemon from "@/daemon/accounts";
import { finishLogin } from "@/lib/diagnostics";
import type { SliceCreator } from "../types";

type SetupMode = "auto" | "shown" | "hidden";

interface LoginResult {
  provider: AuthProvider;
  loginId: string;
  success: boolean;
  error: string | null;
}

export interface AccountsSlice {
  tools: ToolStatus[] | null;
  toolsError: string | null;
  login: LoginState;
  setup: SetupMode;

  loadTools: () => Promise<void>;
  saveExecutable: (provider: AuthProvider, executable: string) => Promise<void>;
  startLogin: (provider: AuthProvider) => Promise<void>;
  cancelLogin: () => void;
  logout: (provider: AuthProvider) => Promise<void>;
  completeLogin: (result: LoginResult) => void;
  setSetup: (mode: SetupMode) => void;
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

export const createAccountsSlice: SliceCreator<AccountsSlice> = (set, get) => ({
  tools: null,
  toolsError: null,
  login: { phase: "idle" },
  setup: "auto",

  loadTools: async () => {
    try {
      set({ tools: await daemon.fetchDiagnostics(), toolsError: null });
    } catch (error) {
      set({ toolsError: messageOf(error) });
    }
  },

  saveExecutable: async (provider, executable) => {
    await daemon.saveExecutable(provider, executable);
    set({ tools: await daemon.fetchDiagnostics(), toolsError: null });
  },

  startLogin: async (provider) => {
    set({ login: { phase: "starting", provider } });
    try {
      const { loginId, authUrl } = await daemon.startLogin(provider);
      if (get().login.phase === "starting") {
        set({ login: { phase: "waiting", provider, loginId, authUrl } });
      }
    } catch (error) {
      set({ login: { phase: "failed", provider, message: messageOf(error) } });
    }
  },

  cancelLogin: () => set({ login: { phase: "idle" } }),

  logout: async (provider) => {
    try {
      await daemon.logout(provider);
      await get().loadTools();
    } catch (error) {
      get().reportError(error);
    }
  },

  completeLogin: (result) => {
    const next = finishLogin(get().login, result);
    if (next === get().login) return;
    set({ login: next });
    void get().loadTools();
  },

  setSetup: (setup) => set({ setup }),
});
