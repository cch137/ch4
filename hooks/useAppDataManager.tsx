"use client";

import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";

import store from "@cch137/utils/dev/store";
import isHeadless from "@cch137/utils/webpage/is-headless";

import type { StatusResponse, UserInfo } from "@/constants/types";

export const SMALL_SCREEN_W = 720;

type AppData = {
  version: string;
  user: UserInfo;
};

const appDataContext = createContext<
  AppData & {
    origin: string;
    isFocus?: boolean;
    outerWidth?: number;
    innerWidth?: number;
    isSmallScreen: boolean;
    isHeadlessBrowser: boolean;
    user: {
      isPending: boolean;
      isLoggedIn: boolean;
      update: () => Promise<void>;
    };
  }
>(undefined!);

export function AppDataManagerProvider({
  children,
  appData,
}: {
  children: React.ReactNode;
  appData: AppData;
}) {
  const [{ user: u, ..._appData }, setAppData] = useState(appData);

  const [userIsPending, setUserIsPending] = useState(false);
  const update = useCallback(async () => {
    setUserIsPending(true);
    try {
      const res = await (
        await fetch("/api/auth/user", { method: "POST" })
      ).json();
      const { value: user } = res as StatusResponse<UserInfo>;
      if (!user) throw new Error("Failed to fetch user info");
      setAppData((a) => ({ ...a, user }));
    } finally {
      setUserIsPending(false);
    }
  }, [setAppData, setUserIsPending]);
  const user = {
    ...u,
    isLoggedIn: u.auth > 0,
    isPending: userIsPending,
    update,
  };

  const [origin, setOrigin] = useState("");
  const [isFocus, setIsFocus] = useState<boolean>();
  const [innerWidth, setInnerWidth] = useState<number>();
  const [outerWidth, setOuterWidth] = useState<number>();
  const [isHeadlessBrowser, setIsHeadlessBrowser] = useState<boolean>(false);
  const isSmallScreen = (innerWidth || Infinity) < SMALL_SCREEN_W;
  const updateProps = useCallback(() => {
    setInnerWidth(window.innerWidth);
    setOuterWidth(window.innerWidth);
    setIsFocus(document.hasFocus());
  }, [setInnerWidth, setOuterWidth, setIsFocus]);
  useEffect(() => {
    updateProps();
    setOrigin(location.origin);
    setIsHeadlessBrowser(
      (v) =>
        v || isHeadless(window, process.env.NODE_ENV === "development").value
    );
    window.addEventListener("resize", updateProps);
    window.addEventListener("focus", updateProps);
    window.removeEventListener("blur", updateProps);
    return () => {
      window.removeEventListener("resize", updateProps);
      window.removeEventListener("focus", updateProps);
      window.removeEventListener("blur", updateProps);
    };
  }, [updateProps, setOrigin, setIsHeadlessBrowser]);

  return (
    <appDataContext.Provider
      value={{
        ..._appData,
        origin,
        isFocus,
        outerWidth,
        innerWidth,
        isSmallScreen,
        isHeadlessBrowser,
        user,
      }}
    >
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

export function useOrigin() {
  return useAppDataManager().origin;
}

export function useIsFocus() {
  return useAppDataManager().isFocus;
}

export function useIsSmallScreen() {
  return useAppDataManager().isSmallScreen;
}

export function useIsHeadlessBrowser() {
  return useAppDataManager().isHeadlessBrowser;
}

const v = store({ v: "" });
export const vers = () => v.v;
export function useVersion() {
  const { version } = useAppDataManager();
  v.v = version;
  return version;
}
