"use client";

import { useEffect, useState, type RefObject } from "react";
import { useMouse } from "./useAppDataManager";

export default function useIsHover<T extends Element>(el: RefObject<T>) {
  const { elements } = useMouse();
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    setIsHover(elements.has(el.current!));
  }, [el, elements, setIsHover]);

  return isHover;
}
