import { createContext, useContext } from "react";
import type { BootstrapResponse } from "./types";

export interface AppStateValue {
  bootstrap?: BootstrapResponse;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const AppStateContext = createContext<AppStateValue>({
  loading: true,
  refresh: async () => undefined
});

export function useAppState() {
  return useContext(AppStateContext);
}
