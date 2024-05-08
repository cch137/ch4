"use client";

import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";

import store from "@cch137/utils/dev/store";

import type { StatusResponse, UserInfo } from "@/constants/types";
import isHeadless from "@/utils/isHeadless";

export const SMALL_SCREEN_W = 720;

type AppData = {
  serverUA: string;
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
    isBot: boolean;
    botDetect: { [k: string]: boolean };
    mouse: { x: number; y: number; elements: Set<Element> };
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
  const [isBot, setIsBot] = useState<boolean>(false);
  const [botDetect, setBotDetect] = useState<{ [key: string]: boolean }>({});
  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
    elements: new Set<Element>(),
  });
  const isSmallScreen = (innerWidth || Infinity) < SMALL_SCREEN_W;
  const updateProps = useCallback(() => {
    setInnerWidth(window.innerWidth);
    setOuterWidth(window.innerWidth);
    setIsFocus(document.hasFocus());
  }, [setInnerWidth, setOuterWidth, setIsFocus]);
  const updateMouseProps = useCallback(
    ({ clientX: x, clientY: y }: MouseEvent) => {
      setMouse({ x, y, elements: new Set(document.elementsFromPoint(x, y)) });
    },
    [setMouse]
  );
  useEffect(() => {
    setOrigin(location.origin);
    const { value, details = {} } = isHeadless(
      window,
      process.env.NODE_ENV === "development"
    );
    setIsBot((v) => v || value);
    setBotDetect(details);
    updateProps();
    addEventListener("resize", updateProps);
    addEventListener("focus", updateProps);
    addEventListener("blur", updateProps);
    addEventListener("mousemove", updateMouseProps);
    return () => {
      removeEventListener("resize", updateProps);
      removeEventListener("focus", updateProps);
      removeEventListener("blur", updateProps);
      removeEventListener("mousemove", updateMouseProps);
    };
  }, [setOrigin, setIsBot, setBotDetect, updateProps, updateMouseProps]);

  return (
    <appDataContext.Provider
      value={{
        ..._appData,
        origin,
        isFocus,
        outerWidth,
        innerWidth,
        isSmallScreen,
        isBot,
        botDetect,
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

export function useIsBot() {
  return useAppData().isBot;
}

export function useBotDetect() {
  return useAppData().botDetect;
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
