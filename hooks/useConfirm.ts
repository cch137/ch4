'use client';

import { useRef, useState } from 'react';

export default function useConfirm(confirmTimeoutMs = 3000) {
  const confirmTimeout = useRef<NodeJS.Timeout>();
  const [isConfirm, setIsConfirm] = useState(false);

  const onConfirm = (): boolean => {
    if (isConfirm) return true;
    clearTimeout(confirmTimeout.current);
    setIsConfirm(true);
    confirmTimeout.current = setTimeout(() => setIsConfirm(false), confirmTimeoutMs);
    return false;
  }

  return [
    isConfirm,
    onConfirm,
  ] as [boolean, () => boolean];
}