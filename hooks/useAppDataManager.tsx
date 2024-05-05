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
    mouse: { x: number; y: number };
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
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isSmallScreen = (innerWidth || Infinity) < SMALL_SCREEN_W;
  const updateProps = useCallback(() => {
    setInnerWidth(window.innerWidth);
    setOuterWidth(window.innerWidth);
    setIsFocus(document.hasFocus());
  }, [setInnerWidth, setOuterWidth, setIsFocus]);
  const updateMouseProps = useCallback(
    ({ clientX: x, clientY: y }: MouseEvent) => {
      setMouse({ x, y });
    },
    [setMouse]
  );
  useEffect(() => {
    setOrigin(location.origin);
    setIsHeadlessBrowser(
      (v) =>
        v || isHeadless(window, process.env.NODE_ENV === "development").value
    );
    updateProps();
    window.addEventListener("resize", updateProps);
    window.addEventListener("focus", updateProps);
    window.removeEventListener("blur", updateProps);
    window.addEventListener("mousemove", updateMouseProps);
    return () => {
      window.removeEventListener("resize", updateProps);
      window.removeEventListener("focus", updateProps);
      window.removeEventListener("blur", updateProps);
      window.removeEventListener("mousemove", updateMouseProps);
    };
  }, [setOrigin, setIsHeadlessBrowser, updateProps, updateMouseProps]);

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
        mouse,
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
function useAppData() {
  return useContext(appDataContext);
}

export function useOrigin() {
  return useAppData().origin;
}

export function useIsFocus() {
  return useAppData().isFocus;
}

export function useIsSmallScreen() {
  return useAppData().isSmallScreen;
}

export function useIsHeadlessBrowser() {
  return useAppData().isHeadlessBrowser;
}

export function useMouse() {
  return useAppData().mouse;
}

const v = store({ v: "" });
export const vers = () => v.v;
export function useVersion() {
  const s = useAppData().version;
  v.v = s;
  return s;
}

export const userIdCache = store<{ id: string }>({ id: "" });
export function useUserInfo() {
  const u = useAppData().user;
  userIdCache.id = u.id;
  return u;
}
