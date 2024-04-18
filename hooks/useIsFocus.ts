"use client";

import { useState, useEffect } from "react";

export default function useIsFocus() {
  const [isFocus, setIsFocus] = useState<boolean>();

  useEffect(() => {
    const updateIsFocus = () => setIsFocus(document.hasFocus());
    window.addEventListener("focus", updateIsFocus);
    window.addEventListener("blur", updateIsFocus);
    return () => {
      window.removeEventListener("focus", updateIsFocus);
      window.removeEventListener("blur", updateIsFocus);
    };
  }, [setIsFocus]);

  return isFocus;
}
