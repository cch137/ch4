"use client";

import { useState, useEffect, type RefObject, useRef } from "react";

export default function useIsHover<T extends Element>(
  elmentRef: RefObject<T>,
  forceCheck = false
) {
  const [isHover, setIsHover] = useState<boolean>(false);
  const forceCheckInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const el = elmentRef.current;
    if (el === null) return;
    const forceCheckListener = ({ clientX: x, clientY: y }: MouseEvent) => {
      const { top, bottom, left, right } = el.getBoundingClientRect();
      if (!(top <= y && bottom >= y && left <= x && right >= x)) setFalse();
    };
    const setTrue = () => {
      setIsHover(true);
      if (!forceCheck) return;
      clearInterval(forceCheckInterval.current);
      window.addEventListener("mousemove", forceCheckListener);
    };
    const setFalse = () => {
      setIsHover(false);
      if (!forceCheck) return;
      clearInterval(forceCheckInterval.current);
      window.removeEventListener("mousemove", forceCheckListener);
    };
    el.addEventListener("mouseenter", setTrue);
    el.addEventListener("mouseover", setTrue);
    el.addEventListener("mouseleave", setFalse);
    el.addEventListener("mouseout", setFalse);
    return () => {
      el.removeEventListener("mouseenter", setTrue);
      el.removeEventListener("mouseover", setTrue);
      el.removeEventListener("mouseleave", setFalse);
      el.removeEventListener("mouseout", setFalse);
    };
  }, [elmentRef, forceCheck, setIsHover]);

  return isHover;
}
