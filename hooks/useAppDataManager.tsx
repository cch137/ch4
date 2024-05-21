"use client";

import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { IResult as ParsedUa } from "ua-parser-js";

import store from "@cch137/utils/store";

import type { StatusResponse, UserInfo } from "@/constants/types";
import detectBot from "@/utils/detectBot";
import { type HashedShuttle, unpackDataWithHash } from "@cch137/utils/shuttle";
import Emitter from "@cch137/utils/emitter";

export const SMALL_SCREEN_W = 720;

type AppData = {
  isHeadless: boolean;
  version: string;
  user: UserInfo;
  ua: ParsedUa;
  isDev: boolean;
};

type MouseData = {
  x: number;
  y: number;
  d: number;
  elements: Set<Element>;
};

const appDataContext = createContext<
  AppData & {
    origin: string;
    isClient: boolean;
    isFocus?: boolean;
    outerWidth?: number;
    innerWidth?: number;
    outerHeight?: number;
    innerHeight?: number;
    isTouchScreen?: boolean;
    isSmallScreen: boolean;
    isBot: boolean;
    botDetect: { [k: string]: boolean };
    mouse: MouseData;
    user: {
      isPending: boolean;
      isLoggedIn: boolean;
      update: () => Promise<void>;
    };
  }
>(undefined!);

export const swipe = new Emitter<{ left: []; right: []; up: []; down: [] }>();

export function AppDataManagerProvider({
  children,
  appData,
}: {
  children: React.ReactNode;
  appData: HashedShuttle<AppData> | string;
}) {
  const [{ user: u, ..._appData }, setAppData] = useState(
    unpackDataWithHash(appData, 256, 137)
  );

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
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [isTouchScreen, setIsTouchScreen] = useState<boolean>(false);
  const [innerWidth, setInnerWidth] = useState<number>();
  const [outerWidth, setOuterWidth] = useState<number>();
  const [innerHeight, setInnerHeight] = useState<number>();
  const [outerHeight, setOuterHeight] = useState<number>();
  const [isBot, setIsBot] = useState<boolean>(_appData.isHeadless);
  const [botDetect, setBotDetect] = useState<{ [key: string]: boolean }>({});
  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
    d: 0,
    elements: new Set<Element>(),
  });
  const updateProps = useCallback(() => {
    setIsSmallScreen((window.innerWidth || Infinity) < SMALL_SCREEN_W);
    setInnerWidth(window.innerWidth);
    setOuterWidth(window.outerWidth);
    setInnerHeight(window.innerHeight);
    setOuterHeight(window.outerHeight);
    setIsFocus(document.hasFocus());
  }, [
    setIsSmallScreen,
    setInnerWidth,
    setOuterWidth,
    setInnerHeight,
    setOuterHeight,
    setIsFocus,
  ]);
  const updateMouseProps = useCallback(
    ({ clientX: x, clientY: y }: MouseEvent) => {
      setMouse(({ x: x1, y: y1 }) => ({
        x,
        y,
        d: Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2),
        elements: new Set(document.elementsFromPoint(x, y)),
      }));
    },
    [setMouse]
  );
  useEffect(() => {
    setOrigin(location.origin);
    const { value, details = {} } = detectBot({
      ua: _appData.ua,
      dev: _appData.isDev,
    });
    setIsClient(true);
    setIsBot((v) => v || value);
    setBotDetect(details);
    setIsTouchScreen(
      Boolean("ontouchstart" in window || navigator.maxTouchPoints)
    );
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
  }, [
    setOrigin,
    setIsClient,
    setIsBot,
    setBotDetect,
    setIsTouchScreen,
    updateProps,
    updateMouseProps,
  ]);

  // swipe
  const touchStartCoor = useRef([0, 0] as [number, number]);
  useEffect(() => {
    const touchStart = (ev: TouchEvent) => {
      if (ev.touches.length !== 1) return;
      const { screenX, screenY } = ev.touches[0];
      touchStartCoor.current = [screenX, screenY];
    };
    const touchEnd = (ev: TouchEvent) => {
      if (ev.changedTouches.length !== 1) return;
      const { screenX: endX, screenY: endY } = ev.changedTouches[0];
      const [startX, startY] = touchStartCoor.current;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const absDx = Math.abs(deltaX);
      const absDy = Math.abs(deltaY);
      if (absDx > absDy) {
        if (absDx > Math.min(80, (innerWidth || 1e3) / 4))
          swipe.emit(deltaX > 0 ? "left" : "right");
      }
      if (absDx < absDy) {
        if (absDy > Math.min(80, (innerHeight || 1e3) / 4))
          swipe.emit(deltaY > 0 ? "up" : "down");
      }
    };
    addEventListener("touchstart", touchStart);
    addEventListener("touchend", touchEnd);
    return () => {
      removeEventListener("touchstart", touchStart);
      removeEventListener("touchend", touchEnd);
    };
  }, [touchStartCoor]);

  return (
    <appDataContext.Provider
      value={{
        ..._appData,
        origin,
        isClient,
        isFocus,
        outerWidth,
        innerWidth,
        outerHeight,
        innerHeight,
        isSmallScreen,
        isTouchScreen,
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

export function useIsClient() {
  return useAppData().isClient;
}

export function useIsSmallScreen() {
  return useAppData().isSmallScreen;
}

export function useIsTouchScreen() {
  return useAppData().isTouchScreen;
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

export function useUserAgent() {
  return useAppData().ua;
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
