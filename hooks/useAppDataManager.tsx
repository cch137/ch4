"use client";

import { createContext, useState, useContext, useMemo } from "react";
import type {
  AppData,
  Dispatch,
  StatusResponse,
  UserInfo,
} from "@/constants/types";

export type AppDataManager = AppData & {
  user: {
    isPending: boolean;
    isLoggedIn: boolean;
    update: () => Promise<void>;
  };
};

const appDataContext = createContext<AppDataManager>(undefined!);

export function AppDataManagerProvider({
  children,
  appData,
}: {
  children: React.ReactNode;
  appData: AppData;
}) {
  const [_appData, setAppData] = useState(appData);
  const user = useUserInfoManager(_appData.user, (user) =>
    setAppData((a) => ({ ...a, user }))
  );
  return (
    <appDataContext.Provider value={{ user }}>
      {children}
    </appDataContext.Provider>
  );
}

/**
 * **Please use this hook to construct a new hook.** \
 * **Do not use it directly in any component.**
 */
export default function useAppDataManager() {
  return useContext(appDataContext);
}

function useUserInfoManager(user: UserInfo, setUser: Dispatch<UserInfo>) {
  const [isPending, setIsPending] = useState(false);
  return useMemo(() => {
    return {
      get id() {
        return user.id;
      },
      get name() {
        return user.name;
      },
      get auth() {
        return user.auth;
      },
      get isLoggedIn() {
        return user.auth > 0;
      },
      isPending,
      async update() {
        setIsPending(true);
        try {
          const res = await (
            await fetch("/api/auth/user", { method: "POST" })
          ).json();
          const { value: user } = res as StatusResponse<UserInfo>;
          if (!user) throw new Error("Failed to fetch user info");
          setUser(user);
        } finally {
          setIsPending(false);
        }
      },
    };
  }, [user, setUser]);
}
