"use client";

import { useState, useEffect, useCallback } from "react";

export default function useViewWidth() {
  const [viewWidth, setInnerWidth] = useState(0);

  const updateWidth = useCallback(() => {
    if (typeof window === "undefined") return;
    setInnerWidth(window.innerWidth);
  }, [setInnerWidth]);

  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    window.addEventListener("focus", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
      window.removeEventListener("focus", updateWidth);
    };
  }, [updateWidth]);

  return viewWidth;
}

export function useWindowWidth() {
  const [innerWidth, setInnerWidth] = useState(0);
  const [outerWidth, setOuterWidth] = useState(0);

  const updateWidth = useCallback(() => {
    if (typeof window === "undefined") return;
    setInnerWidth(window.innerWidth);
    setOuterWidth(window.innerWidth);
  }, [setInnerWidth, setOuterWidth]);

  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    window.addEventListener("focus", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
      window.removeEventListener("focus", updateWidth);
    };
  }, [updateWidth]);

  return { innerWidth, outerWidth };
}
