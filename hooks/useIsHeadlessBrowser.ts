'use client';

import { useEffect, useState } from 'react';

import store from '@cch137/utils/dev/store';
import isHeadless from '@cch137/utils/webpage/is-headless';

const isHeadlessBrowserStore = store(
  { value: false },
  () => {
    if (typeof window === 'undefined') return;
    return isHeadless(window, process.env.NODE_ENV === 'development');
  },
  { autoInit: true },
);

export default function useIsHeadlessBrowser() {
  const [v, _v] = useState(isHeadlessBrowserStore.value);
  useEffect(() => isHeadlessBrowserStore.$on(o => _v(o.value)));
  return v;
};
