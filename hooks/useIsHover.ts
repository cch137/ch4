"use client";

import { useEffect, useState, type RefObject } from "react";
import { useMouse } from "./useAppDataManager";

export default function useIsHover<T extends Element>(el: RefObject<T> | T) {
  const { x, y } = useMouse();
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    const element = el instanceof Element ? el : el.current;
    if (!element) return setIsHover(false);
    const { top, bottom, left, right } = element.getBoundingClientRect();
    setIsHover(top <= y && bottom >= y && left <= x && right >= x);
  }, [el, x, y, setIsHover]);

  return isHover;
}
