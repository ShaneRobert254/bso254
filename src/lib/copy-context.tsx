import { createContext, useContext, type ReactNode } from "react";
import { defaultCopy, type SiteCopy } from "@/lib/settings";

const CopyContext = createContext<SiteCopy>(defaultCopy);

export function CopyProvider({ value, children }: { value: SiteCopy; children: ReactNode }) {
  return <CopyContext.Provider value={value}>{children}</CopyContext.Provider>;
}

export function useCopy() {
  return useContext(CopyContext);
}
