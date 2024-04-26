"use client";

import { useState, useEffect, useCallback } from "react";

export default function useViewWidth() {
  const [viewWidth, setInnerWidth] = useState<number>();

  const updateWidth = useCallback(() => {
    setInnerWidth(window.innerWidth);
  }, [setInnerWidth]);

  useEffect(() => {
    updateWidth();
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
  const [innerWidth, setInnerWidth] = useState<number>();
  const [outerWidth, setOuterWidth] = useState<number>();

  const updateWidth = useCallback(() => {
    setInnerWidth(window.innerWidth);
    setOuterWidth(window.innerWidth);
  }, [setInnerWidth, setOuterWidth]);

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    window.addEventListener("focus", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
      window.removeEventListener("focus", updateWidth);
    };
  }, [updateWidth]);

  return { innerWidth, outerWidth };
}
