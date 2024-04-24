"use client";

import { useState } from "react";

export default function useToggle(initial = false) {
  const [value, setIsConfirm] = useState(initial);
  const toggle = () => setIsConfirm(!value);
  return [value, toggle] as [boolean, () => void];
}
