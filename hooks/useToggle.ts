"use client";

import { useState } from "react";

export default function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue(!value);
  return [value, toggle] as [boolean, () => void];
}
