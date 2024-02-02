'use client';

import { useEffect, useState } from 'react';

export const SMALL_SCREEN_W = 720;

export default function useIsSmallScreen() {
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  useEffect(() => {
    const detectSmallScreen = () => setIsSmallScreen(window.innerWidth < SMALL_SCREEN_W);
    detectSmallScreen();
    window.addEventListener('resize', detectSmallScreen);
    return () => window.removeEventListener('resize', detectSmallScreen);
  }, [setIsSmallScreen]);

  return isSmallScreen;
};
