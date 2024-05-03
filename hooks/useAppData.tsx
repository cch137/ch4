"use client";

import type { AppData, SetState } from "@/constants/types";
import { createContext, useState, useContext } from "react";

const appDataContext = createContext<{
  appData: AppData;
  setAppData: SetState<AppData>;
}>({
  appData: {
    user: { id: "", name: "", auth: 0 },
  },
  setAppData: (a: any) => {},
});

export function AppDataProvider({
  children,
  appData,
}: {
  children: React.ReactNode;
  appData: AppData;
}) {
  const [_appData, setAppData] = useState(appData);
  return (
    <appDataContext.Provider value={{ appData: _appData, setAppData }}>
      {children}
    </appDataContext.Provider>
  );
}

/**
 * **Please use this hook to construct a new hook.** \
 * **Do not use it directly in any component.**
 */
export default function useAppData() {
  return useContext(appDataContext);
}
