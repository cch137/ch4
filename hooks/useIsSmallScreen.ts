"use client";

import store from "@cch137/utils/dev/store";
import { useEffect, useState } from "react";

export const SMALL_SCREEN_W = 720;

const ref = store(
  { value: false, _inited: false },
  () => {
    if (!ref.$inited) {
      window.addEventListener("resize", ref.$update);
    }
    if (typeof window === "undefined") return { value: false };
    return { value: window.innerWidth < SMALL_SCREEN_W };
  },
  { initAfterOn: true }
);

export default function useIsSmallScreen() {
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(ref.value);

  useEffect(
    () => ref.$on(({ value }) => setIsSmallScreen(value)),
    [setIsSmallScreen]
  );

  return isSmallScreen;
}
