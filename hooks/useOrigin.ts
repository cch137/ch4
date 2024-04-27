"use client";

import { useEffect, useState } from "react";

export default function useOrigin() {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(location.origin), [setOrigin]);
  return origin;
}
