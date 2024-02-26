"use client";

import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export default function useInit(
  effect: EffectCallback,
  deps: DependencyList = []
) {
  const inited = useRef(false);
  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    return effect();
  }, [...deps, inited]);
  return inited;
}
